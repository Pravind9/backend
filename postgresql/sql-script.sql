DROP TABLE IF EXISTS public.fx_person_profile;
CREATE TABLE IF NOT EXISTS public.fx_person_profile(
	oid bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 100001 MINVALUE 100001 MAXVALUE 9223372036854775807 CACHE 1 ),
	uid varchar(100) NOT NULL UNIQUE,
    dname varchar(100),
	fname varchar(50), 
	mname varchar(50),
	lname varchar(50),	
	mobile varchar(15),
	mtype varchar(100),
	constraint fx_user_profile_pk primary key(oid)
);

DROP TABLE IF EXISTS public.fx_person;
CREATE TABLE IF NOT EXISTS public.fx_person(
    oid bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 100001 MINVALUE 100001 MAXVALUE 9223372036854775807 CACHE 1 ),
    uid varchar(100) NOT NULL UNIQUE,
    dname varchar(100),
    password varchar(128),
    logged_in boolean,
    status varchar(100),
    CONSTRAINT fx_person_pk PRIMARY KEY (oid)
);