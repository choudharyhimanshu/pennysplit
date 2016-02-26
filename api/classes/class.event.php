<?php
	
/**
	* @author Himanshu Choudhary
	* @email himanshuchoudhary@live.com
*/

class Event {

	public function createNew(){
		Global $app, $db;
	    $app->response->headers->set('Content-Type', 'application/json');

	    $body = $app->request->getBody();
	    $params = json_decode($body,TRUE);

	    $title = isset($params['title']) ? $params['title'] : '';
	    $currency = isset($params['currency']) ? $params['currency'] : 'INR';
	    $owner = isset($params['owner']) ? $params['owner'] : '';
	    $members = isset($params['members']) ? $params['members'] : [];

	    $response = array(
	    	'success' => FALSE,
	    	'message' => '',
	    	'data' => NULL
	    );

	    if($title != '' && $owner != '' && sizeof($members)>0){
	    	$time = time();
	    	$title_slug = Helper::slugify($title);
	    	$slug = $title_slug.'-'.Helper::generateRandomString();
	    	$view_slug = $title_slug.'-'.Helper::generateRandomString();

	    	$db->connect();
	    	$res = $db->conn->query("INSERT INTO event (slug,view_slug,title,currency,created_by,created_on) VALUES ('$slug','$view_slug','$title','$currency','$owner',$time)");
	    	if($res){
	    		$fkeid = $db->conn->insert_id;
	    		$values = [];
	    		foreach( $members as $member ) {
	    		    $values[] = '('.$fkeid.','.$member['id'].',"'.$member['name'].'",'.$time.')';
	    		}
	    		$res = $db->conn->query('INSERT INTO buddies (eid,mid,name,added_on) VALUES '.implode(',', $values));
	    		if($res) {
	    			$response['success'] = TRUE;
	    			$response['message'] = "Successfully created event.";
	    			$response['data'] = array(
	    				'title' => $title,
	    				'currency' => $currency,
	    				'owner' => $owner,
	    				'created_on' =>  $time,
	    				'slug' => $slug,
	    				'pub_slub' => $view_slug
	    			);
	    		}
	    		else {
	    			$response['message'] = "Unable to add buddies. Error : ".$db->conn->error;
	    		}
	    	}
	    	else {
	    		$response['message'] = "Unable to create event. Error : ".$db->conn->error;
	    	}
	    }
	    else {
	    	$response['message'] = 'Invalid Form Data.';
	    }

	    $app->response->write(json_encode($response));
	}
}
?>