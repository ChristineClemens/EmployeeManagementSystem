USE cms_db;

INSERT INTO department (name)
VALUES ("Teacher Training"), ("ESL Instruction"), ("Homestay Accommodations"), ("Level Evaluation"), ("EAP Program");

INSERT INTO role (title, salary, department_id)
VALUES ("ESL Instructor", 35000, 2), ("Homestay Coordinator", 40000, 3),
	   ("CELTA Trainer", 50000, 1), ("DELTA Trainer", 55000, 1), ("Orientation Supervisor", 30000, 4),
       ("Pathways Instructor", 40000, 5), ("Cambridge Instructor", 40000, 5), ("IELTS Instructor", 45000, 5);
       
INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Christine", "Clemens", 1), ("Matthew", "Ciraulo", 6), ("Marijke", "De Looze", 4),
	   ("Dave", "Jameson", 8), ("Sayaka", "Yamamoto", 2), ("Stephen", "Birek", 5),
       ("Deborah", "Primeau", 1), ("Elyse", "Caplan", 1), ("Vernon", "Finney", 1);