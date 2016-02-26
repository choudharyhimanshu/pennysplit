<?php

	/**
		* @author Himanshu Choudhary
		* @email himanshuchoudhary@live.com
	*/
		
	include 'config/globals.php';

	$app->get('/', function () {
	    echo "Hello World!";
	});

	$app->post('/event/create', 'Event:createNew');

	$app->run();
?>