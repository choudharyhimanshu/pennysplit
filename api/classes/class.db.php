<?php
	
/**
	* @author Himanshu Choudhary
	* @email himanshuchoudhary@live.com
*/

class Database {

	private $host      = DB_HOSTNAME;
	private $user      = DB_USERNAME;
	private $pass      = DB_PASSWORD;
	private $dbname    = DB_DATABASE;
	
	public $conn;

	public function connect(){
		$this->conn = new mysqli($this->host, $this->user, $this->pass, $this->dbname);

		if ($this->conn->connect_error){
			return FALSE;
	  	}
	  	return TRUE;
	}

	public function close()
	{
		$this->conn->close();
	}
}
?>