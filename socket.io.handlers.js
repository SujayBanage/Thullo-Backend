import Column from "./Models/Columns.js";
import Task from "./Models/Task.js";

import { checkColumnExists } from "./utils/checkExistance.js";
const socketHanlder = (io, socket) => {
  return {
    taskDND: async ({
      fromColumnId,
      toColumnId,
      task_id,
      fromTaskIndex,
      toTaskIndex,
      board_id,
    }) => {
      const fromColumn = await checkColumnExists(fromColumnId);
      const toColumn = await checkColumnExists(toColumnId);

      if (!fromColumn.column._id.equals(toColumn.column._id)) {
        console.log("columns are diff : ");
        const fromColumnTasks = fromColumn.column.tasks;
        const toColumnTasks = toColumn.column.tasks;
        const toColumnTaskPart1 = toColumnTasks.slice(0, toTaskIndex);
        const toColumnTaskPart2 = toColumnTasks.slice(
          toTaskIndex,
          toColumnTasks.length
        );
        toColumnTaskPart1.push(task_id);
        fromColumnTasks.splice(fromTaskIndex, 1);
        const toColumnTasksFinal = [...toColumnTaskPart1, ...toColumnTaskPart2];

        try {
          const result1 = await Column.findByIdAndUpdate(
            { _id: fromColumn.column._id },
            {
              $set: {
                tasks: fromColumnTasks,
              },
            },
            {
              new: true,
            }
          );

          const result2 = await Column.findByIdAndUpdate(
            { _id: toColumn.column._id },
            {
              $set: {
                tasks: toColumnTasksFinal,
              },
            },
            {
              new: true,
            }
          );

          const result3 = await Task.updateOne(
            { _id: task_id },
            {
              $set: {
                column: {
                  name: toColumn.column.name,
                  column_id: toColumn.column._id,
                },
              },
            }
          );

          if (result1 && result2 && result3) {
            return io.to(socket.id).emit("shift-task-success", {
              message: "Task Shift Successfull!",
              fromColumnId,
              toColumnId,
              fromColumnTasks: result1.tasks,
              toColumnTasks: result2.tasks,
            });
          }
          return io.to(socket.id).emit("shift-task-fail", {
            message: "Task Shift Failed!",
          });
        } catch (err) {
          return io.to(socket.id).emit("shift-task-fail", {
            message: "Task Shift Failed!",
          });
        }
      } else {
        console.log("columns are same : ");

        const columnTasks = fromColumn.column.tasks;
        columnTasks.splice(fromTaskIndex, 1);
        columnTasks.splice(toTaskIndex, 0, task_id);
        try {
          const result = await Column.findByIdAndUpdate(
            { _id: fromColumn.column._id },
            {
              $set: {
                tasks: columnTasks,
              },
            },
            {
              new: true,
            }
          );

          if (result) {
            return io.to(socket.id).emit("shift-task-success", {
              message: "Task Shift Successfull!",
              fromColumnId,
              fromColumnTasks: result.tasks,
            });
          }
        } catch (err) {
          return id.to(socket.id).emit("shift-task-fail", {
            message: "Task Shift Failed!",
          });
        }
      }
    },
  };
};
export default socketHanlder;
