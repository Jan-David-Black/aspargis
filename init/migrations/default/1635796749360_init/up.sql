SET check_function_bodies = false;
CREATE TABLE public."Correction_Sensorposition" (
    "SensorID" integer NOT NULL,
    pos integer NOT NULL
);
CREATE TABLE public."SGroups" (
    "SGroup" integer NOT NULL,
    "Position" text,
    "Sorte" integer,
    "Owner" text,
    "Alarm" double precision
);
CREATE SEQUENCE public.value_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public."Sensor_Values" (
    id integer DEFAULT nextval('public.value_id_seq'::regclass) NOT NULL,
    "SensorID" integer,
    "Timestamp" timestamp without time zone DEFAULT date_trunc('minute'::text, now()) NOT NULL,
    "Value" double precision
);
CREATE SEQUENCE public.sensor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public."Sensors" (
    "SensorID" integer DEFAULT nextval('public.sensor_id_seq'::regclass) NOT NULL,
    "Type" text,
    "SGroup" integer,
    "Address" text
);
CREATE TABLE public."Spargelsorten" (
    "SorteID" integer NOT NULL,
    "Name" text
);
CREATE TABLE public."TempKorrekturDaten" (
    "Address" character varying(16) NOT NULL,
    "Korrektur_0" double precision NOT NULL,
    "Korrektur_100" double precision NOT NULL
);
CREATE TABLE public."Users" (
    user_id text NOT NULL,
    email text,
    subscriptions jsonb
);
CREATE VIEW public.daily AS
 SELECT "Sensor_Values"."SensorID",
    date_trunc('day'::text, "Sensor_Values"."Timestamp") AS date_trunc,
    avg("Sensor_Values"."Value") AS avg,
    max("Sensor_Values"."Value") AS max,
    min("Sensor_Values"."Value") AS min
   FROM public."Sensor_Values"
  GROUP BY "Sensor_Values"."SensorID", (date_trunc('day'::text, "Sensor_Values"."Timestamp"))
  ORDER BY "Sensor_Values"."SensorID", (date_trunc('day'::text, "Sensor_Values"."Timestamp"));
CREATE TABLE public.share (
    "SGroup" integer NOT NULL,
    "User" text NOT NULL,
    "Alarm" double precision
);
ALTER TABLE ONLY public."Correction_Sensorposition"
    ADD CONSTRAINT "Correction_Sensorposition_pkey" PRIMARY KEY ("SensorID");
ALTER TABLE ONLY public."SGroups"
    ADD CONSTRAINT "SGroups_pkey" PRIMARY KEY ("SGroup");
ALTER TABLE ONLY public."Sensor_Values"
    ADD CONSTRAINT "Sensor_Values_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Sensors"
    ADD CONSTRAINT "Sensors_SGroup_Type_key" UNIQUE ("SGroup", "Type");
ALTER TABLE ONLY public."Sensors"
    ADD CONSTRAINT "Sensors_pkey" PRIMARY KEY ("SensorID");
ALTER TABLE ONLY public."Spargelsorten"
    ADD CONSTRAINT "Spargelsorten_pkey" PRIMARY KEY ("SorteID");
ALTER TABLE ONLY public."TempKorrekturDaten"
    ADD CONSTRAINT "TempKorrekturDaten_pkey" PRIMARY KEY ("Address");
ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (user_id);
ALTER TABLE ONLY public.share
    ADD CONSTRAINT share_pkey PRIMARY KEY ("SGroup", "User");
ALTER TABLE ONLY public."Correction_Sensorposition"
    ADD CONSTRAINT "Correction_Sensorposition_SensorID_fkey" FOREIGN KEY ("SensorID") REFERENCES public."Sensors"("SensorID") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SGroups"
    ADD CONSTRAINT "SGroups_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES public."Users"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SGroups"
    ADD CONSTRAINT "SGroups_Sorte_fkey" FOREIGN KEY ("Sorte") REFERENCES public."Spargelsorten"("SorteID") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Sensor_Values"
    ADD CONSTRAINT "Sensor_Values_SensorID_fkey" FOREIGN KEY ("SensorID") REFERENCES public."Sensors"("SensorID") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Sensors"
    ADD CONSTRAINT "Sensors_SGroup_fkey" FOREIGN KEY ("SGroup") REFERENCES public."SGroups"("SGroup") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."TempKorrekturDaten"
    ADD CONSTRAINT "TempKorrekturDaten_Address_fkey" FOREIGN KEY ("Address") REFERENCES public."TempKorrekturDaten"("Address") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.share
    ADD CONSTRAINT "share_SGroup_fkey" FOREIGN KEY ("SGroup") REFERENCES public."SGroups"("SGroup") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.share
    ADD CONSTRAINT "share_User_fkey" FOREIGN KEY ("User") REFERENCES public."Users"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
