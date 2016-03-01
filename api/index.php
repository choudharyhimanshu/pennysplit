<?php

	/**
		* @author Himanshu Choudhary
		* @email himanshuchoudhary@live.com
	*/
		
	include 'config/globals.php';

	$app->get('/', function () {
	    echo "Hello World!";
	});

	$app->post('/event/create', 'Event:create');
	$app->put('/event/edit/:slug', 'Event:edit');
	$app->get('/event/view/private/:slug', 'Event:getPrivate');
	$app->get('/event/view/public/:slug', 'Event:getPublic');

	$app->run();
?>