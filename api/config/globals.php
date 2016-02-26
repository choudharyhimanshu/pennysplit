<?php

	/**
		* @author Himanshu Choudhary
		* @email himanshuchoudhary@live.com
	*/

	error_reporting(-1);
	ini_set('display_errors', 'On');

	define('APP_BASE', 'http://local.pennysplit.com/');
	define('API_BASE', 'http://local.pennysplit.com/api/');
	define('PENNY_SALT', 'k!cK$0me@s$');
	

	include 'db_config.php';
	include 'classes/class.db.php';
	include 'classes/class.event.php';
	include 'classes/class.helper.php';
	include 'classes/class.security.php';

	require 'vendor/autoload.php';

	$app = new Slim\Slim();
	$db = new Database();
	
?>