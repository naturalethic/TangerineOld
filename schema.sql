DEFINE TABLE _identity SCHEMAFULL PERMISSIONS NONE;
DEFINE FIELD username ON _identity TYPE string;
DEFINE FIELD password ON _identity TYPE string;
DEFINE INDEX username ON TABLE _identity FIELDs username UNIQUE;

DEFINE SCOPE identity SESSION 24h
	SIGNUP (
        CREATE _identity SET username = $username, password = crypto::argon2::generate($password)
    )
	SIGNIN (
        SELECT * FROM _identity WHERE username = $username AND crypto::argon2::compare(password, $password)
    )
;

CREATE _identity SET username = 'admin', password = crypto::argon2::generate('admin');
