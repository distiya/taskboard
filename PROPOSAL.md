# Task Planner dashboard

The provided code base contains a partially completed implementation of a SpringBoot application using Thymeleaf. The requirement is to create 4x4 quadtrant dashboard which contains tasks and each task can have multiple task

# A single qudrant view

There should be an heading in each quadrant with + button when click the task window will popup
There should be a list view to show all of the tasks under this quadrant. Each tile of the list view will show task title, due date, number of sub tasks and switcher to move this task to a different quadrant and a checkbox to check when task is completed. When checked task title must be striked
When click on each tile task window will popup

# Task window

1. There should be text field for task title
2. There should a text area for task description
3. There should be a date picker for due date selection.
4. There should be check box for mark whether support is needed
5. There should be seperate section for sub task where there will be a  text field and add button. Once the add button is clicked the subtask will be added to the beow list view. Each title in subtask will have sub task title, a check for completion and due date picker. When sub task is checked it is stricked and UI will collable to done section where all done subtasked will be collapsed
6. There should be a section to add comments and show already added comments for this task where most recent comment will be at the top. Comment message and created and modified date will be shown
7. There should be a button to delete the task, cancel button to close the view and save button to make save. This save should be browser save

# Board view

1. There should be a header in which i says 2x2 TASK PLANNER on the left and there will be Task overview to say how many active tasks. There shoul be 3 buttons sync, backup, and share
2. There should be four quadreants, top left quadrant title is SELECTIVELY INVEST and sub title is HIGH VALUE, HIGH EFFORT and top right quadrant title is DO FIRST / DRIVE DAILY and subtitle is HIGH VALUE, LOW EFFORT and Bottom left quadrant tite is IGNORE / DELAY and subtitle is LOW VALUE, HIGH EFFORT and bottom right quadrant title is WORK IN while subtitle is LOW VALUE, LOW EFFORT

Please read the source code in follwing files to understand the domain objects

@./src/main/java/io/github/distiya/taskboard/domain/Board.java
@./src/main/java/io/github/distiya/taskboard/domain/Comment.java
@./src/main/java/io/github/distiya/taskboard/domain/GenericTask.java
@./src/main/java/io/github/distiya/taskboard/domain/GenericTaskType.java
@./src/main/java/io/github/distiya/taskboard/domain/SubTask.java
@./src/main/java/io/github/distiya/taskboard/domain/Task.java

Then read the implementation

@./src/main/java/io/github/distiya/taskboard/infrastructure/BoardController.java

Then complete the thymeleaf template implementation to match above requirement. the thymeleaf file can be  @./src/main/resources/templates/my-board.html. Please edit the same file.