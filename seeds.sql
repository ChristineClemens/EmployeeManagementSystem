USE cms_db;

INSERT INTO department (name)
VALUES ("Teacher Training"), 
       ("ESL Instruction"), 
       ("Homestay Accommodations"), 
       ("Level Evaluation"), 
       ("EAP Program"),
       ("Directors");

INSERT INTO role (title, salary, department_id)
VALUES ("ESL Instructor", 35000, (SELECT id FROM department WHERE name = "ESL Instruction")), 
       ("Homestay Coordinator", 40000, (SELECT id FROM department WHERE name = "Homestay Accommodations")),
	   ("CELTA Trainer", 50000, (SELECT id FROM department WHERE name = "Teacher Training")), 
       ("DELTA Trainer", 55000, (SELECT id FROM department WHERE name = "Teacher Training")), 
       ("Orientation Supervisor", 30000, (SELECT id FROM department WHERE name = "Level Evaluation")), 
       ("Pathways Instructor", 40000, (SELECT id FROM department WHERE name = "EAP Program")), 
       ("Cambridge Instructor", 40000, (SELECT id FROM department WHERE name = "EAP Program")), 
       ("IELTS Instructor", 45000, (SELECT id FROM department WHERE name = "EAP Program")),
       ("Director of Studies", 65000, (SELECT id FROM department WHERE name = "Directors")),
       ("Assistant Director of Studies", 60000, (SELECT id FROM department WHERE name = "Directors"));
       
INSERT INTO employee (first_name, last_name, role_id)
VALUES ("John", "Friel", (SELECT id FROM role WHERE title = "Director of Studies")),
       ("Paola", "Rizzi", (SELECT id FROM role WHERE title = "Assistant Director of Studies")),
       ("Vanessa", "Di Maria", (SELECT id FROM role WHERE title = "Assistant Director of Studies")),
       ("Ashley Louise", "Brown", (SELECT id FROM role WHERE title = "Assistant Director of Studies"));

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Christine", "Clemens", (SELECT id FROM role WHERE title = "ESL Instructor"), 1), 
       ("Matthew", "Ciraulo", (SELECT id FROM role WHERE title = "Pathways Instructor"), 2), 
       ("Marijke", "De Looze", (SELECT id FROM role WHERE title = "DELTA Trainer"), 1),
	   ("Dave", "Jameson", (SELECT id FROM role WHERE title = "IELTS Instructor"), 3), 
       ("Sayaka", "Yamamoto", (SELECT id FROM role WHERE title = "Homestay Coordinator"), 1), 
       ("Stephen", "Birek", (SELECT id FROM role WHERE title = "Orientation Supervisor"), 1),
       ("Deborah", "Primeau", (SELECT id FROM role WHERE title = "ESL Instructor"), 1), 
       ("Elyse", "Caplan", (SELECT id FROM role WHERE title = "ESL Instructor"), 1), 
       ("Vernon", "Finney", (SELECT id FROM role WHERE title = "ESL Instructor"), 1);



