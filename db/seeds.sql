USE employee_db;

INSERT INTO departments (dept_name)
VALUES
('Engineering'),
('IT'),
('Finance'),
('Research and Development'),
('Training');

INSERT INTO roles (title, salary, dept_id)
VALUES
('Group Leader', 80000, 1),
('Sub Group Leader', 70000, 2),
('Group Leader Trainee', 60000, 2),
('Group Coordinator', 70000, 3),
('Sub Group Coordinator', 60000, 3),
('Group Analyzer', 70000, 4),
('Sub Group Analyzer', 60000, 4),
('Group Helper', 70000, 5),
('Tech Guy', 50000, 5),
('Group Recorder', 40000, 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
('Bob', 'Smith', 1, null),
('Smith', 'Bob', 2, 1),
('Harris', 'Joe', 3, 2),
('Dee', 'Inda', 4, 1),
('George', 'Clark', 5, 4),
('Robert', 'June', 6, 1),
('Ann', 'Tran', 7, 6),
('Kathy', 'Tran', 8, 4),
('Ali', 'Khan', 9, 5),
('Fred', 'Doe', 10, 2);