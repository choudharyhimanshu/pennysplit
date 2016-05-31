<?php
    
/**
    * @author Himanshu Choudhary
    * @email himanshuchoudhary@live.com
*/

class General {

    static public function subscribe()
    {
        Global $app, $db;
        $db->connect();
        $app->response->headers->set('Content-Type', 'application/json');

        $body = $app->request->getBody();
        $params = json_decode($body,TRUE);
        $params = Helper::sanitize($params);

        $email = isset($params['email']) ? $params['email'] : '';

        $response = array(
            'success' => FALSE,
            'message' => '',
            'data' => NULL
        );

        if($email != ''){
            $time = date("Y-m-d H:i:s");
            if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
                $ip = $_SERVER['HTTP_CLIENT_IP'];
            } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
            } else {
                $ip = $_SERVER['REMOTE_ADDR'];
            }

            $res = $db->conn->query("INSERT INTO subscriptions VALUES('$email','$time','$ip')");

            if($res){
                $response['success'] = TRUE;
                $response['message'] = 'Thanks for the love.';
            }
            else {
                if($db->conn->errno == 1062){
                    $response['message'] = 'Already Subscribed.';
                }
                else {
                    $response['message'] = 'Some error occurred. Please try again later.';
                }
            }
        }
        else {
            $response['message'] = 'Invalid inputs.';
        }
        
        $db->close();
        $app->response->write(json_encode($response));
    }
}
?>