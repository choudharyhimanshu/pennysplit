<?php
	
/**
	* @author Himanshu Choudhary
	* @email himanshuchoudhary@live.com
*/

class Event {

	public function create(){
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
	    	if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
	    	    $ip = $_SERVER['HTTP_CLIENT_IP'];
	    	} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
	    	    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	    	} else {
	    	    $ip = $_SERVER['REMOTE_ADDR'];
	    	}
	    	$title_slug = Helper::slugify($title);
	    	$slug = $title_slug.'-'.Helper::generateRandomString();
	    	$view_slug = $title_slug.'-'.Helper::generateRandomString();

	    	$res = $db->conn->query("INSERT INTO event (slug,view_slug,title,currency,created_by,created_on,user_ip) VALUES ('$slug','$view_slug','$title','$currency','$owner',$time,'$ip')");
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

	public function edit($slug){
		Global $app, $db;
		$db->connect();
	    $app->response->headers->set('Content-Type', 'application/json');

	    $body = $app->request->getBody();
	    $params = json_decode($body,TRUE);
	    $params = Helper::sanitize($params);

	    $slug = isset($slug) ? Helper::sanitize($slug) : '';
	    $title = isset($params['title']) ? $params['title'] : '';
	    $currency = isset($params['currency']) ? $params['currency'] : 'INR';
	    $owner = isset($params['owner']) ? $params['owner'] : '';
	    $members = isset($params['members']) ? $params['members'] : [];
	    $delete_members = isset($params['delete_members']) ? $params['delete_members'] : [];

	    $response = array(
	    	'success' => FALSE,
	    	'message' => '',
	    	'data' => NULL
	    );

	    if($slug != '' && $title != '' && $owner != '' && sizeof($members)>0){
	    	$time = time();

	    	$res = $db->conn->query("UPDATE event SET title='$title',currency= '$currency',created_by='$owner' WHERE slug='$slug' COLLATE latin1_general_cs");
	    	if($res){
	    		$fkeid = Security::getIdFromSlug($slug);

	    		if($fkeid != NULL){
	    			$res = $db->conn->query("DELETE FROM buddies WHERE fk_eid='$fkeid'");
	    			if($res){
	    				$values = [];
	    				foreach( $members as $member ) {
	    				    $values[] = '('.$fkeid.','.$member['id'].',"'.$member['name'].'",'.$time.')';
	    				}
	    				$res = $db->conn->query('INSERT INTO buddies (fk_eid,mid,name,added_on) VALUES '.implode(',', $values));
	    				if($res) {
	    					$res = SELF::deleteMembers($fkeid,$delete_members);
	    					if($res){
	    						$response['success'] = TRUE;
	    						$response['message'] = "Successfully updated event.";
	    						$response['data'] = array(
	    							'title' => $title,
	    							'currency' => $currency,
	    							'owner' => $owner,
	    							'slug' => $slug
	    						);
	    					}
	    					else {
			    				$response['message'] = "Unable to delete buddies.";
	    					}
	    				}
	    				else {
	    					$response['message'] = "Unable to add buddies. Error : ".$db->conn->error;
	    				}
	    			}
	    			else {
	    				$response['message'] = "Unable to delete buddies. Error : ".$db->conn->error;
	    			}
	    		}
	    		else {
	    			$response['message'] = 'Some error occurred.';
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

	    $res = $db->conn->query("SELECT eid,slug,view_slug,title,currency,created_on,created_by FROM event WHERE slug = '$slug' COLLATE latin1_general_cs");

	    if ($res) {
	    	if($res->num_rows == 1){
	    		$row = $res->fetch_assoc();

	    		$eid = $row['eid'];

	    		$response['data']['slug'] = $row['slug'];
	    		$response['data']['view_slug'] = $row['view_slug'];
	    		$response['data']['title'] = $row['title'];
	    		$response['data']['currency'] = $row['currency'];
	    		$response['data']['owner'] = $row['created_by'];
	    		$response['data']['created_on'] = $row['created_on'];

	    		$response['data']['members'] = SELF::getMembers($eid);
	    		$response['data']['members_count'] = sizeof($response['data']['members']);

	    		$response['data']['expenses'] = SELF::getExpenses($eid);
	    		$response['data']['expenses_count'] = sizeof($response['data']['expenses']);

	    		$event_total = 0;
	    		foreach ($response['data']['expenses'] as $expense) {
	    			$event_total += $expense['tot_amount'];
	    		}

	    		$response['data']['total_spent'] = round($event_total,2);
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

	public function getPvtSettlements($slug)
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

	    $res = $db->conn->query("SELECT eid FROM event WHERE slug = '$slug' COLLATE latin1_general_cs");

	    if ($res) {
	    	if($res->num_rows == 1){
	    		$row = $res->fetch_assoc();

	    		$eid = $row['eid'];

	    		$response['data'] = SELF::getSettlements($eid);
	    		$response['success'] = TRUE;
	    		$response['message'] = 'Successfully fetched settlements.';
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

	public function getPublic($slug)
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

	    $res = $db->conn->query("SELECT eid,view_slug,title,currency,created_on,created_by FROM event WHERE view_slug = '$slug' COLLATE latin1_general_cs");

	    if ($res) {
	    	if($res->num_rows == 1){
	    		$row = $res->fetch_assoc();

	    		$eid = $row['eid'];

	    		$response['data']['slug'] = $row['view_slug'];
	    		$response['data']['title'] = $row['title'];
	    		$response['data']['currency'] = $row['currency'];
	    		$response['data']['owner'] = $row['created_by'];
	    		$response['data']['created_on'] = $row['created_on'];

	    		$response['data']['members'] = SELF::getMembers($eid);
	    		$response['data']['members_count'] = sizeof($response['data']['members']);

	    		$response['data']['expenses'] = SELF::getExpenses($eid);
	    		$response['data']['expenses_count'] = sizeof($response['data']['expenses']);

	    		$response['data']['settlements'] = SELF::getSettlements($eid);

	    		$event_total = 0;
	    		foreach ($response['data']['expenses'] as $expense) {
	    			$event_total += $expense['tot_amount'];
	    		}

	    		$response['data']['total_spent'] = round($event_total,2);
	    		$response['data']['view_url'] = APP_BASE.'/view/'.$response['data']['slug'];

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


	private function getMembers($eid)
	{
		Global $db;
		$members = [];

		$res = $db->conn->query("SELECT mid, name, added_on FROM buddies WHERE fk_eid=$eid");
		if($res){
			while ($row = $res->fetch_assoc()) {
				$members[] = array(
					'id' => (int)$row['mid'],
					'name' => $row['name'],
					'added_on' => $row['added_on']
				);
			}
		}
		return $members;
	}

	private function getExpenses($eid)
	{
		Global $db;

		$expenses = [];
		$members = SELF::getMembers($eid);


		$res = $db->conn->query("SELECT expenses.exid, expenses.name, expenses.fk_added_by, expenses.created_on, expenses.tot_amount, payers.mid as `payer_id`, payers.amount as `payer_amount` FROM expenses LEFT JOIN payers ON payers.fk_exid = expenses.exid WHERE expenses.fk_eid = $eid ORDER BY exid ASC");

		if($res){
			if($res->num_rows > 0){
				$row = $res->fetch_assoc();

				$count_exp = 0;

				$prev_exid = $row['exid'];
				$expenses[] = array(
					'id' => (int)$row['exid'],
					'name' => $row['name'],
					'added_by' => (int)$row['fk_added_by'],
					'added_by_name' => Helper::getNameFromId($members,(int)$row['fk_added_by']),
					'created_on' => $row['created_on'],
					'tot_amount' => 0,
					'payers' => [],
					'payees' => []
				);

				if(Helper::getIndexFromId($members,(int)$row['payer_id']) !== NULL){
					$expenses[$count_exp]['tot_amount'] += (double)$row['payer_amount'];
					$expenses[$count_exp]['payers'][] = array(
						'id' => (int)$row['payer_id'],
						'name' => Helper::getNameFromId($members,(int)$row['payer_id']),
						'amount' => (double)$row['payer_amount'] 
					);
				}

				while ($row = $res->fetch_assoc()) {
					if($row['exid'] != $prev_exid){
						$prev_exid = $row['exid'];
						$expenses[] = array(
							'id' => (int)$row['exid'],
							'name' => $row['name'],
							'added_by' => (int)$row['fk_added_by'],
							'added_by_name' => Helper::getNameFromId($members,(int)$row['fk_added_by']),
							'created_on' => $row['created_on'],
							'tot_amount' => 0,
							'payers' => [],
							'payees' => []
						);
						$count_exp++;
					}
					if(Helper::getIndexFromId($members,(int)$row['payer_id']) !== NULL){
						$expenses[$count_exp]['tot_amount'] += (double)$row['payer_amount'];
						$expenses[$count_exp]['payers'][] = array(
							'id' => (int)$row['payer_id'],
							'name' => Helper::getNameFromId($members,(int)$row['payer_id']),
							'amount' => (double)$row['payer_amount'] 
						);
					}
				}
			}
		}

		$res = $db->conn->query("SELECT expenses.exid, expenses.name, payees.mid as `payee_id` FROM expenses LEFT JOIN payees ON payees.fk_exid = expenses.exid WHERE expenses.fk_eid = $eid ORDER BY exid ASC");

		if($res){
			if($res->num_rows > 0){
				$row = $res->fetch_assoc();

				$count_exp = 0;

				$prev_exid = $row['exid'];

				if(Helper::getIndexFromId($members,(int)$row['payee_id']) !== NULL){
					$expenses[$count_exp]['payees'][] = array(
						'id' => (int)$row['payee_id'],
						'name' => Helper::getNameFromId($members,(int)$row['payee_id'])
					);
				}

				while ($row = $res->fetch_assoc()) {
					if($row['exid'] != $prev_exid){
						$prev_exid = $row['exid'];
						$count_exp++;	
					}

					if($expenses[$count_exp]['id'] == $row['exid']){
						if(Helper::getIndexFromId($members,(int)$row['payee_id']) !== NULL){
							$expenses[$count_exp]['payees'][] = array(
								'id' => (int)$row['payee_id'],
								'name' => Helper::getNameFromId($members,(int)$row['payee_id'])
							);
						}
					}
				}
			}
		}

		return $expenses;
	}

	private function getSettlements($eid)
	{
		$members = SELF::getMembers($eid);
		$expenses = SELF::getExpenses($eid);

		$balances = [];
		$baskets = [];
		$settlements = [];

		foreach ($members as $member) {
			$balances[] = array(
				'id' => $member['id'],
				'name' => $member['name'],
				'balance' => 0
			);
		}

		foreach ($expenses as $expense) {
			$total_amount = 0.0;
			foreach ($expense['payers'] as $payer) {
				$index = Helper::getIndexFromId($balances,$payer['id']);
				if ($index !== NULL) {
    				$balances[$index]['balance'] += $payer['amount'];
    				$total_amount += round($payer['amount'],2);
				}
			}
			$num_sharers = sizeof($expense['payees']);
			foreach ($expense['payees'] as $payee) {
				$index = Helper::getIndexFromId($balances,$payee['id']);
				if ($index !== NULL) {
    				$balances[$index]['balance'] -= round($total_amount/$num_sharers,2);
				}
			}
			$expense['tot_amount'] = $total_amount;
		}

		$baskets['positive'] = [];
		$baskets['negative'] = [];
		$baskets['clear'] = [];

		foreach ($balances as $balance) {
			if ($balance['balance'] > 0) {
				$baskets['positive'][] = $balance;
			}
			elseif ($balance['balance'] < 0) {
				$baskets['negative'][] = $balance;
			}
			elseif ($balance['balance'] == 0) {
				$baskets['clear'][] = $balance;
			}
		}

		$master_baskets = $baskets;

		$index_pos_basket = 0;

		for ($i=0; $i < sizeof($baskets['negative']); $i++) {
			if ($index_pos_basket >= sizeof($baskets['positive'])) {
				break;
			}
			if(abs($baskets['negative'][$i]['balance']) == $baskets['positive'][$index_pos_basket]['balance']){
				$settlements[] = array(
					'from' => array(
						'id' => $baskets['negative'][$i]['id'],
						'name' => $baskets['negative'][$i]['name']
					),
					'to' => array(
						'id' => $baskets['positive'][$index_pos_basket]['id'],
						'name' => $baskets['positive'][$index_pos_basket]['name']
					),
					'amount' => round(abs($baskets['negative'][$i]['balance']),2)
				);
				$baskets['positive'][$index_pos_basket]['balance'] = 0;
				$baskets['negative'][$i]['balance'] = 0;
				$index_pos_basket++;
			}
			elseif(abs($baskets['negative'][$i]['balance']) < $baskets['positive'][$index_pos_basket]['balance']){
				$settlements[] = array(
					'from' => array(
						'id' => $baskets['negative'][$i]['id'],
						'name' => $baskets['negative'][$i]['name']
					),
					'to' => array(
						'id' => $baskets['positive'][$index_pos_basket]['id'],
						'name' => $baskets['positive'][$index_pos_basket]['name']
					),
					'amount' => round(abs($baskets['negative'][$i]['balance']),2)
				);
				$baskets['positive'][$index_pos_basket]['balance'] += $baskets['negative'][$i]['balance'];
				$baskets['negative'][$i]['balance'] = 0;
			}
			elseif(abs($baskets['negative'][$i]['balance']) > $baskets['positive'][$index_pos_basket]['balance']){
				$settlements[] = array(
					'from' => array(
						'id' => $baskets['negative'][$i]['id'],
						'name' => $baskets['negative'][$i]['name']
					),
					'to' => array(
						'id' => $baskets['positive'][$index_pos_basket]['id'],
						'name' => $baskets['positive'][$index_pos_basket]['name']
					),
					'amount' => round(abs($baskets['positive'][$index_pos_basket]['balance']),2)
				);
				$baskets['negative'][$i]['balance'] += $baskets['positive'][$index_pos_basket]['balance'];
				$baskets['positive'][$index_pos_basket]['balance'] += 0;
				$i--;$index_pos_basket++;
			}
		}

		return array(
			'balances' => $balances,
			'baskets' => $master_baskets,
			'settlements' => $settlements
		);
	}

	private function deleteMembers($eid,$mids)
	{
		if(empty($mids)){
			return TRUE;
		}

		Global $db;
		$mids_str = join(',', $mids);
		$flag = FALSE;

		$expenses = $db->conn->query("SELECT exid FROM expenses WHERE fk_eid=$eid;");
		if($expenses){
			while ($row = $expenses->fetch_assoc()) {
				$exid = $row['exid'];
				$res = $db->conn->query("DELETE FROM payers WHERE fk_exid='$exid' AND mid IN ($mids_str);");
				if ($res) {
					$res = $db->conn->query("DELETE FROM payees WHERE fk_exid='$exid' AND mid IN ($mids_str);");
					if ($res) {
						$flag = TRUE;
					}
					else {
						$flag = FALSE;
					}
				}
				else {
					$flag = FALSE;
				}
			}
		}
		else {
			$flag = FALSE;
		}
		return $flag;
	}
}
?>