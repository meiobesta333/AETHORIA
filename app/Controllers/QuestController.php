<?php
declare(strict_types=1);

final class QuestController {
    public static function action(): void {
        $user = require_auth();
        header('Content-Type: application/json; charset=utf-8');
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            http_response_code(405); echo json_encode(['ok'=>false,'message'=>'Método não permitido']); return;
        }
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!is_string($token) || !hash_equals(csrf_token(), $token)) {
            http_response_code(419); echo json_encode(['ok'=>false,'message'=>'Sessão expirada']); return;
        }
        $data = json_decode((string)file_get_contents('php://input'), true) ?: [];
        $characterId = filter_var($data['character'] ?? null, FILTER_VALIDATE_INT);
        $npcId = filter_var($data['npc'] ?? null, FILTER_VALIDATE_INT);
        $action = (string)($data['action'] ?? '');
        if (!$characterId || !$npcId || !in_array($action, ['accept','claim'], true)) {
            http_response_code(422); echo json_encode(['ok'=>false,'message'=>'Ação inválida']); return;
        }
        $pdo = db();
        try {
            $pdo->beginTransaction();
            $q = $pdo->prepare('SELECT id,map_code,tile_x,tile_y FROM characters WHERE id=? AND user_id=? FOR UPDATE');
            $q->execute([$characterId,$user['id']]);
            $character = $q->fetch();
            if (!$character) { $pdo->rollBack(); http_response_code(404); echo json_encode(['ok'=>false,'message'=>'Personagem não encontrado']); return; }
            $q = $pdo->prepare('SELECT * FROM world_npcs WHERE id=? AND map_code=?');
            $q->execute([$npcId,$character['map_code']]);
            $npc = $q->fetch();
            if (!$npc || abs((int)$character['tile_x']-(int)$npc['tile_x']) + abs((int)$character['tile_y']-(int)$npc['tile_y']) > 1) {
                $pdo->rollBack(); http_response_code(422); echo json_encode(['ok'=>false,'message'=>'Aproxime-se do NPC para interagir']); return;
            }
            $q = $pdo->prepare('SELECT * FROM quests WHERE npc_code=? LIMIT 1');
            $q->execute([$npc['code']]);
            $quest = $q->fetch();
            if (!$quest) { $pdo->rollBack(); http_response_code(404); echo json_encode(['ok'=>false,'message'=>'Nenhuma missão disponível']); return; }
            $q = $pdo->prepare('SELECT * FROM character_quests WHERE character_id=? AND quest_id=? FOR UPDATE');
            $q->execute([$characterId,$quest['id']]);
            $state = $q->fetch();
            if ($action === 'accept') {
                if ($state) { $pdo->rollBack(); http_response_code(409); echo json_encode(['ok'=>false,'message'=>'Esta missão já foi iniciada']); return; }
                $q = $pdo->prepare("INSERT INTO character_quests(character_id,quest_id,status,progress,accepted_at) VALUES(?,?,'accepted',0,UTC_TIMESTAMP())");
                $q->execute([$characterId,$quest['id']]);
                $pdo->commit();
                echo json_encode(['ok'=>true,'status'=>'accepted','message'=>'Missão aceita: '.$quest['title'],'quest'=>$quest['title']]); return;
            }
            if (!$state || $state['status'] !== 'completed') {
                $pdo->rollBack(); http_response_code(409); echo json_encode(['ok'=>false,'message'=>'Conclua o objetivo antes de reivindicar a recompensa']); return;
            }
            $reward = (int)$quest['reward_experience'];
            $q = $pdo->prepare("UPDATE characters SET experience=experience+?,updated_at=UTC_TIMESTAMP() WHERE id=?");
            $q->execute([$reward,$characterId]);
            $q = $pdo->prepare("UPDATE character_quests SET status='claimed',claimed_at=UTC_TIMESTAMP() WHERE character_id=? AND quest_id=?");
            $q->execute([$characterId,$quest['id']]);
            $pdo->commit();
            echo json_encode(['ok'=>true,'status'=>'claimed','reward'=>$reward,'message'=>'Recompensa recebida: +'.$reward.' XP']); 
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $error;
        }
    }
}
