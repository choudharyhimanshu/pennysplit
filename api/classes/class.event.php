<?php
	
/**
	* @author Himanshu Choudhary
	* @email himanshuchoudhary@live.com
*/

class Event {

	public function createNew(){
		Global $app, $db;
		$db->connect();
	    $app->response->headers->set('Content-Type', 'application/json');

	    $body = $app->request->getBody();
	    $params = json_decode($body,TRUE);
	    $params = Helper::sanitize($params);

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

	    	$res = $db->conn->query("INSERT INTO event (slug,view_slug,title,currency,created_by,created_on) VALUES ('$slug','$view_slug','$title','$currency','$owner',$time)");
	    	if($res){
	    		$fkeid = $db->conn->insert_id;
	    		$values = [];
	    		foreach( $members as $member ) {
	    		    $values[] = '('.$fkeid.','.$member['id'].',"'.$member['name'].'",'.$time.')';
	    		}
	    		$res = $db->conn->query('INSERT INTO buddies (fk_eid,mid,name,added_on) VALUES '.implode(',', $values));
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

	    $db->close();
	    $app->response->write(json_encode($response));
	}

	public function getPrivate($slug)
	{
		Global $app, $db;
	    $app->response->headers->set('Content-Type', 'application/json');

	    $db->connect();

	    $slug = Helper::sanitize($slug);

	    $response = array(
	    	'success' => FALSE,
	    	'message' => '',
	    	'data' => NULL
	    );

	    $res = $db->conn->query("SELECT slug,view_slug,title,currency,created_on,created_by,mid,name,added_on FROM event INNER JOIN buddies ON event.eid = buddies.fk_eid WHERE event.slug = '$slug'");

	    if ($res) {
	    	if($res->num_rows > 0){
	    		$count_mem = 1;
	    		$row = $res->fetch_assoc();

	    		$response['data']['slug'] = $row['slug'];
	    		$response['data']['view_slug'] = $row['view_slug'];
	    		$response['data']['title'] = $row['title'];
	    		$response['data']['currency'] = $row['currency'];
	    		$response['data']['owner'] = $row['created_by'];
	    		$response['data']['created_on'] = $row['created_on'];
	    		$response['data']['members'][] = array(
	    			'id' => $row['mid'],
	    			'name' => $row['name'],
	    			'added_on' => $row['added_on']
	    		);

	    		while ($row = $res->fetch_assoc()) {
	    			$count_mem++;
	    			$response['data']['members'][] = array(
	    				'id' => $row['mid'],
	    				'name' => $row['name'],
	    				'added_on' => $row['added_on']
	    			);
	    		}

	    		$response['data']['members_count'] = $count_mem;
	    		$response['data']['edit_url'] = APP_BASE.'/edit/'.$response['data']['slug'];
	    		$response['data']['view_url'] = APP_BASE.'/view/'.$response['data']['view_slug'];

	    		$response['success'] = TRUE;
	    		$response['message'] = 'Successfully fetched the event.';
	    	}
	    	else {
	    		$response['message'] = 'Event not found.';
	    	}
	    }
	    else {
	    	$response['message'] = 'Some error occurred. Error : '.$db->conn->error;
	    }

	    $db->close();
	    $app->response->write(json_encode($response));
	}
}
?>