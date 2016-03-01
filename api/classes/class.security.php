<?php
    
/**
    * @author Himanshu Choudhary
    * @email himanshuchoudhary@live.com
*/

class Security {

    static public function getIdFromSlug($slug)
    {
        Global $db;
        $slug = Helper::sanitize($slug);
        $res = $db->conn->query("SELECT eid FROM event WHERE slug='$slug'");
        if($res){
            $row = $res->fetch_assoc();
            $uid = isset($row['eid']) ? $row['eid'] : NULL; 
            return $uid;
        }
        else {
            return NULL;
        }
    }
}
?>