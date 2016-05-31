<?php
	
/**
	* @author Himanshu Choudhary
	* @email himanshuchoudhary@live.com
*/

class Expense {
	public function add($slug)
	{
		Global $app, $db;
		$db->connect();
	    $app->response->headers->set('Content-Type', 'application/json');

	    $body = $app->request->getBody();
	    $params = json_decode($body,TRUE);
	    $params = Helper::sanitize($params);

	    $slug = isset($slug) ? Helper::sanitize($slug) : '';
	    $name = isset($params['name']) ? $params['name'] : '';
	    $added_by = isset($params['added_by']) ? $params['added_by'] : "NULL";
	    $added_by = !empty($params['added_by']) ? $added_by : "NULL";
	    $payers = isset($params['payers']) ? $params['payers'] : [];
	    $payees = isset($params['payees']) ? $params['payees'] : [];

	    $tot_amount_paid = 0.0;
	    for ($i=0; $i < sizeof($payers); $i++) {
	    	$payers[$i]['id'] = (int)$payers[$i]['id'];
	    	$payers[$i]['amount'] = (float)round($payers[$i]['amount'],2);
	    	$tot_amount_paid += $payers[$i]['amount'];
	    }

	    $tot_amount_shared = 0.0;
	    for ($i=0; $i < sizeof($payees); $i++) {
	    	$payees[$i]['id'] = (int)$payees[$i]['id'];
	    	$payees[$i]['amount'] = (float)round($payees[$i]['amount'],2);
	    	$tot_amount_shared += $payees[$i]['amount'];
	    }

	    $response = array(
	    	'success' => FALSE,
	    	'message' => '',
	    	'data' => NULL
	    );

	    if($slug != '' && $name != '' && sizeof($payers)>0 && sizeof($payees)>0 && $tot_amount_paid==$tot_amount_shared){
	    	$time = time();
	    	$fk_eid = Security::getIdFromSlug($slug);
	    	if($fk_eid != NULL){
		    	$res = $db->conn->query("INSERT INTO expenses (fk_eid,name,fk_added_by,created_on,tot_amount) VALUES ($fk_eid,'$name',$added_by,$time,$tot_amount_paid)");
	    		if($res){
		    		$fk_xid = $db->conn->insert_id;
		    		$values = [];
		    		foreach( $payers as $payer ) {
		    		    $values[] = '('.$fk_xid.','.$payer['id'].','.$payer['amount'].')';
		    		}
		    		$res = $db->conn->query('INSERT INTO payers (fk_exid,mid,amount) VALUES '.implode(',', $values));
		    		if($res){
		    			$values = [];
		    			foreach( $payees as $payee ) {
		    			    $values[] = '('.$fk_xid.','.$payee['id'].','.$payee['amount'].')';
		    			}
		    			$res = $db->conn->query('INSERT INTO payees (fk_exid,mid,amount) VALUES '.implode(',', $values));
		    			if($res){
		    				$response['success'] = TRUE;
		    				$response['message'] = "Successfully added expense.";
		    			}
		    			else{
			    			$response['message'] = "Unable to add payees. Error : ".$db->conn->error;
		    			}
		    		}
		    		else{
		    			$response['message'] = "Unable to add payers. Error : ".$db->conn->error;
		    		}
	    		}
	    		else {
		    		$response['message'] = "Unable to add expense. Error : ".$db->conn->error;
	    		}
	    	}
	    	else {
    			$response['message'] = 'Some error occurred.';
	    	}
	    }
	    else {
	    	$response['message'] = 'Invalid Inputs.';
	    }

	    $db->close();
	    $app->response->write(json_encode($response));
	}

	public function delete($slug,$exid)
	{
		Global $app, $db;
	    $app->response->headers->set('Content-Type', 'application/json');

	    $db->connect();

	    $exid = Helper::sanitize($exid);

	    $response = array(
	    	'success' => FALSE,
	    	'message' => '',
	    	'data' => NULL
	    );

	    $eid = Security::getIdFromSlug($slug);

	    if($eid != NULL){
	    	$res = $db->conn->query("SELECT exid FROM expenses WHERE fk_eid=$eid AND exid=$exid");

	    	if($res && $res->num_rows == 1){
	    		$res = $db->conn->multi_query("DELETE FROM payers WHERE fk_exid=$exid;
	    			DELETE FROM payees WHERE fk_exid=$exid;
	    			DELETE FROM expenses WHERE exid=$exid;");

	    		if ($res) {
	    			$response['success'] = TRUE;
	    			$response['message'] = 'Successfully deleted the expense.';
	    		}
	    		else {
	    			$response['message'] = 'Could not delete the expense. Error : '.$db->conn->error;
	    		}
	    	}
	    	else {
		    	$response['message'] = 'Invalid expense.';
	    	}
	    }
	    else {
	    	$response['message'] = 'Invalid slug.';
	    }

	    $db->close();
	    $app->response->write(json_encode($response));
	}
}
?>