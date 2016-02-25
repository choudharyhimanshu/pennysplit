<?php

	/**
		* @author Himanshu Choudhary
		* @email himanshuchoudhary@live.com
	*/
		
	include 'config/globals.php';

	$app->get('/hello/:name', function ($name) {
	    echo "Hello, " . $name;
	});

	$app->run();
?>