<?php
declare(strict_types=1);
function csrf_token():string{if(empty($_SESSION['_csrf']))$_SESSION['_csrf']=bin2hex(random_bytes(32));return $_SESSION['_csrf'];}
function csrf_field():string{return '<input type="hidden" name="_csrf" value="'.e(csrf_token()).'">';}
function verify_csrf():void{$v=$_POST['_csrf']??'';if(!is_string($v)||!hash_equals(csrf_token(),$v)){http_response_code(419);exit('Sessão expirada. Atualize a página.');}}
function current_user():?array{return isset($_SESSION['user_id'])?['id'=>(int)$_SESSION['user_id'],'email'=>(string)($_SESSION['user_email']??'')]:null;}
function require_auth():array{$u=current_user();if(!$u)redirect('/login');return $u;}
function flash(string $m,string $t='info'):void{$_SESSION['_flash']=['message'=>$m,'type'=>$t];}
function consume_flash():?array{$f=$_SESSION['_flash']??null;unset($_SESSION['_flash']);return $f;}
