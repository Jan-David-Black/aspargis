CREATE TABLE public."Correction_Sensorposition" (
    "SensorID" integer NOT NULL,
    pos integer NOT NULL
);
CREATE TABLE public."SGroups" (
    "SGroup" integer NOT NULL,
    "Position" text,
    "Sorte" integer
);
CREATE TABLE public."Sensor_Values" (
    id integer NOT NULL,
    "SensorID" integer,
    "Timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "Value" double precision
);
CREATE TABLE public."Sensors" (
    "SensorID" integer NOT NULL,
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
ALTER TABLE ONLY public."Correction_Sensorposition"
    ADD CONSTRAINT "Correction_Sensorposition_pkey" PRIMARY KEY ("SensorID");
ALTER TABLE ONLY public."SGroups"
    ADD CONSTRAINT "SGroups_pkey" PRIMARY KEY ("SGroup");
ALTER TABLE ONLY public."Sensor_Values"
    ADD CONSTRAINT "Sensor_Values_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Sensors"
    ADD CONSTRAINT "Sensors_pkey" PRIMARY KEY ("SensorID");
ALTER TABLE ONLY public."Spargelsorten"
    ADD CONSTRAINT "Spargelsorten_pkey" PRIMARY KEY ("SorteID");
ALTER TABLE ONLY public."TempKorrekturDaten"
    ADD CONSTRAINT "TempKorrekturDaten_pkey" PRIMARY KEY ("Address");
ALTER TABLE ONLY public."Correction_Sensorposition"
    ADD CONSTRAINT "Correction_Sensorposition_SensorID_fkey" FOREIGN KEY ("SensorID") REFERENCES public."Sensors"("SensorID") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SGroups"
    ADD CONSTRAINT "SGroups_Sorte_fkey" FOREIGN KEY ("Sorte") REFERENCES public."Spargelsorten"("SorteID") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Sensor_Values"
    ADD CONSTRAINT "Sensor_Values_SensorID_fkey" FOREIGN KEY ("SensorID") REFERENCES public."Sensors"("SensorID") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Sensors"
    ADD CONSTRAINT "Sensors_SGroup_fkey" FOREIGN KEY ("SGroup") REFERENCES public."SGroups"("SGroup") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."TempKorrekturDaten"
    ADD CONSTRAINT "TempKorrekturDaten_Address_fkey" FOREIGN KEY ("Address") REFERENCES public."TempKorrekturDaten"("Address") ON UPDATE RESTRICT ON DELETE RESTRICT;
