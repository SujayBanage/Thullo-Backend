import Attachment from "../Models/Attachment.js";
import Board from "../Models/Board.js";
import Column from "../Models/Columns.js";
import Task from "../Models/Task.js";
import Comment from "../Models/Comments.js";
import {
  checkAttachmentExists,
  checkBoardExists,
  checkColumnExists,
  checkCommentExists,
  checkTaskExists,
  checkUserExists,
} from "../utils/checkExistance.js";

const updateTaskName = async (req, res) => {
  const { task_id, name } = req.body;
  const { exists, task } = await checkTaskExists(task_id);
  if (!exists || !task) {
    return res.status(404).send({
      message: "Task Not Found!",
    });
  }
  try {
    await Task.updateOne(
      { _id: task_id },
      {
        $set: {
          name,
        },
      }
    );
  } catch (err) {
    return res.status(500).send({
      message: err.mesage,
    });
  }
  return res.status(200).send({
    mesage: "Task Name Update Successfull!",
  });
};

const taskDND = async (req, res) => {
  const { fromColumnId, toColumnId, task_id, fromTaskIndex, toTaskIndex } =
    req.body;

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
    // toColumnTaskPart1.push(fromColumnTasks[fromTaskIndex]);
    toColumnTaskPart1.push(task_id);
    fromColumnTasks.splice(fromTaskIndex, 1);
    const toColumnTasksFinal = [...toColumnTaskPart1, ...toColumnTaskPart2];

    try {
      const result1 = await Column.updateOne(
        { _id: fromColumn.column._id },
        {
          $set: {
            tasks: fromColumnTasks,
          },
        }
      );

      const result2 = await Column.updateOne(
        { _id: toColumn.column._id },
        {
          $set: {
            tasks: toColumnTasksFinal,
          },
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
        return res.status(200).send({
          message: "Task Drag Drop successfull!!",
        });
      }
      return res.status(500).send({
        message: "react drag and drop failed",
      });
    } catch (err) {
      return res.status(500).send({
        message: err.message,
      });
    }
  } else {
    console.log("columns are same : ");

    const columnTasks = fromColumn.column.tasks;
    // const columnTasksPart1 = columnTasks.slice(0, toTaskIndex);
    // const columnTasksPart2 = columnTasks.slice(toTaskIndex, columnTasks.length);
    columnTasks.splice(fromTaskIndex, 1);
    columnTasks.splice(toTaskIndex, 0, task_id);
    // const columnTasksFinal = [...columnTasksPart1, ...columnTasksPart2];
    try {
      const result = await Column.updateOne(
        { _id: fromColumn.column._id },
        {
          $set: {
            tasks: columnTasks,
          },
        }
      );
      if (result) {
        return res.status(200).send({
          message: "task drag and drop successfull!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        message: err.message,
      });
    }
  }
};

const getAllTasksByColumnId = async (req, res) => {
  const { column_id } = req.params;
  const { exists, column, err } = await checkColumnExists(column_id);
  if (!exists || err) {
    return res.status(500).send({
      message: err,
    });
  }
  return res.status(200).send({
    allTasks: column.tasks,
  });
};

const createTask = async (req, res) => {
  const { name, column_id } = req.body;
  const { column } = await checkColumnExists(column_id);
  const column_board = await Board.findOne({
    "columns.column_id": column._id,
    "columns.name": column.name,
  });
  const { board } = await checkBoardExists(column_board._id);
  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Create Task",
    });
  }

  try {
    const task = await Task.create({
      name,
      column: {
        name: column.name,
        column_id: column._id,
      },
      admin: req.user._id,
    });

    const resultFromColumn = await Column.updateOne(
      { _id: column._id },
      { $push: { tasks: task._id } }
    );

    if (!task || !resultFromColumn) {
      return res.status(500).send({
        error: true,
        message: "Task Creation Failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  return res.status(200).send({
    error: false,
    message: "Task Creation Successfull!",
  });
};

const deleteTask = async (req, res) => {
  const { task_id, column_id } = req.body;
  const { task } = await checkTaskExists(task_id);
  const { column } = await checkColumnExists(column_id);

  const column_board = await Board.findOne({
    "columns.column_id": column._id,
    "columns.name": column.name,
  });
  const { board } = await checkBoardExists(column_board._id);
  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Delete Task",
    });
  }

  try {
    const resultFromTask = await Task.deleteOne({ _id: task._id });
    const resultFromColumn = await Column.updateOne(
      { _id: column._id },
      { $pull: { tasks: task._id } }
    );
    if (!resultFromColumn || !resultFromTask) {
      return res.status(500).send({
        error: true,
        message: "Task deletion Failed",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  return res.status(200).send({
    error: false,
    message: "Task Deletion Successfull!",
  });
};

const shiftTask = async (req, res) => {
  const { from_column, to_column, task_id } = req.body;
  const column_1 = await checkColumnExists(res, from_column);
  const column_2 = await checkColumnExists(res, to_column);
  const { task } = await checkTaskExists(res, task_id);

  const column_board_1 = await Board.findOne({
    "columns.column_id": column_1.column._id,
    "columns.name": column_1.column.name,
  });

  const column_board_2 = await Board.findOne({
    "columns.column_id": column_2.column._id,
    "columns.name": column_2.column.name,
  });

  const board_1 = await checkBoardExists(res, column_board_1._id);
  const board_2 = await checkBoardExists(res, column_board_2._id);

  if (board_1._id !== board_2._id) {
    return res.status(403).send({
      message: "Task Shifting is allow in same board!",
    });
  }

  if (
    !board_1.admin.user_id.equals(req.user._id) ||
    !board_2.admin.user_id.equals(req.user._id)
  ) {
    return res.status(403).send({
      message: "Only Admins Can Shift Task",
    });
  }

  try {
    const resultFromColumn1 = await Column.updateOne(
      { _id: column_1.column._id },
      {
        $pull: { tasks: task._id },
      }
    );
    const resultFromColumn2 = await Column.updateOne(
      {
        _id: column_2.column._id,
      },
      {
        $push: { tasks: task._id },
      }
    );

    const resultfromtask = await Task.updateOne(
      { _id: task._id },
      {
        $set: {
          column: {
            column_id: column_2.column._id,
            name: column_2.column.name,
          },
        },
      }
    );

    if (!resultFromColumn1 || !resultFromColumn2 || !resultfromtask) {
      return res.status(500).send({
        message: "Task Shift Failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }

  return res.status(200).send({
    message: "Task Shift Successfull!",
  });
};

const taskDescriptionUpdate = async (req, res) => {
  const { task_id, description } = req.body;
  const { task } = await checkTaskExists(task_id);

  const column_board = await Board.findOne({
    "columns.column_id": task.column.column_id,
    "columns.name": task.column.name,
  });
  const { board } = await checkBoardExists(column_board._id);

  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      message: "Only Admins Can Edit Task Description",
    });
  }

  try {
    const result = await Task.updateOne(
      { _id: task._id },
      {
        $set: {
          description,
        },
      }
    );
    if (!result) {
      return res.status(500).send({
        message: "Task Description Update Failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
  return res.status(200).send({
    message: "Task Description Update Successfull!",
  });
};

const taskUserAdd = async (req, res) => {
  const { task_id, user_id } = req.body;
  const { task } = await checkTaskExists(task_id);
  const { user } = await checkUserExists(user_id);
  if (!task.admin.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Add User!",
    });
  }
  try {
    const resultFromTask = await Task.updateOne(
      { _id: task._id },
      {
        $push: {
          users: {
            user_id: user._id,
            username: user.username,
            profileImage: user.profileImage,
          },
        },
      }
    );
    if (!resultFromTask) {
      return res.status(500).send({
        error: true,
        message: "Task User Add Failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
  return res.status(200).send({
    error: false,
    message: "Task User Add Successfull!",
  });
};

const taskAttachmentUpload = async (req, res) => {
  const public_key = req.attachment_public_key;
  const src = req.attachment_url;
  const name = req.body.name;

  console.log("public_key is : ", public_key);

  const { task_id } = req.body;

  const { task } = await checkTaskExists(task_id);

  if (!task.admin.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Upload Attachments",
    });
  }

  try {
    const attachment = await Attachment.create({
      name,
      public_key,
      src,
      user: {
        user_id: req.user._id,
        username: req.user.username,
      },
    });

    const taskUpdate = await Task.updateOne(
      { _id: task._id },
      { $push: { attachments: attachment._id } }
    );
    if (!attachment || !taskUpdate) {
      return res.status(500).send({
        error: true,
        message: "Attachment Upload Failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  return res.status(200).send({
    error: false,
    message: "Attachment Upload Successfull!",
  });
};

const taskAttachmentDelete = async (req, res) => {
  const { attachment_id, task_id } = req.body;
  const { task } = await checkTaskExists(task_id);
  const { attachment } = await checkAttachmentExists(attachment_id);

  if (!task.admin.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      mesage: "Only Admins Can Delete the Attachments!",
    });
  }
  try {
    const attachmentResult = await Attachment.deleteOne({
      _id: attachment._id,
    });
    const taskResult = await Task.updateOne(
      { _id: task._id },
      { $pull: { attachments: attachment._id } }
    );
    if (!attachmentResult || !taskResult) {
      return res.status(500).send({
        error: true,
        message: "Attachment Deletion Successfull!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
  return res.status(200).send({
    error: false,
    message: "Attachment Delete Successfull!",
  });
};

const taskLableAdd = async (req, res) => {
  const { text, color, task_id } = req.body;
  const { task } = await checkTaskExists(task_id);
  try {
    const label = {
      text,
      color,
    };
    const taskResult = await Task.updateOne(
      { _id: task._id },
      { $push: { labels: label } }
    );

    if (!taskResult) {
      return res.status(500).send({
        message: "Label Add Failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
  return res.status(200).send({
    message: "Label Add Successfull!",
  });
};

const addComment = async (req, res) => {
  const { task_id, text } = req.body;
  const { task } = await checkTaskExists(task_id);
  const { user } = await checkUserExists(req.user._id);
  try {
    const comment = await Comment.create({
      text,
      user: {
        user_id: user._id,
        username: user.username,
        profileImage: user.profileImage,
      },
    });

    const taskUpdate = await Task.updateOne(
      { _id: task._id },
      { $push: { comments: comment._id } }
    );

    if (!taskUpdate || !comment) {
      return res.status(500).send({
        message: "Add Comment Failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
  return res.status(200).send({
    message: "Comment Added Successfully!",
  });
};

const deleteComment = async (req, res) => {
  const { comment_id, task_id } = req.body;
  const { comment } = await checkCommentExists(comment_id);
  const { task } = await checkTaskExists(task_id);

  if (!req.user._id.equals(task.admin)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Delete Comments!",
    });
  }

  try {
    const commentResult = await Comment.deleteOne({ _id: comment._id });
    const taskResult = await Task.updateOne(
      { _id: task._id },
      { $pull: { comments: comment._id } }
    );
    if (!commentResult || !taskResult) {
      return res.status(500).send({
        error: true,
        message: "Comment Deletion Failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
  return res.status(500).send({
    error: false,
    message: "Comment Deletion Successfull!",
  });
};

const getTaskById = async (req, res) => {
  const { task_id } = req.params;
  const { task } = await checkTaskExists(task_id);
  return res.status(200).send({
    task,
  });
};

const getAttachmentById = async (req, res) => {
  console.log("get attachment by id is running! ");
  const { attachment_id } = req.params;
  const { attachment } = await checkAttachmentExists(attachment_id);
  console.log("attachment is : ", attachment);
  return res.status(200).send({
    attachment,
  });
};

const getCommentById = async (req, res) => {
  console.log("get comment by id is running! ");
  const { comment_id } = req.params;
  const { comment } = await checkCommentExists(comment_id);
  console.log("comment is : ", comment);
  return res.status(200).send({
    comment,
  });
};

const taskImageUpdate = async (req, res) => {
  const { image, task_id } = req.body;
  const { task } = await checkTaskExists(task_id);

  if (!req.user._id.equals(task.admin)) {
    return res.status(403).send({
      message: "Only Admins Can Change Image!",
    });
  }

  try {
    const taskResult = await Task.updateOne(
      { _id: task._id },
      {
        $set: {
          image,
        },
      }
    );
    if (!taskResult) {
      return res.status(500).send({
        message: "task image update failed!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
  return res.status(200).send({
    message: "Task Image Upadte Successfull!",
  });
};

export {
  createTask,
  deleteTask,
  shiftTask,
  taskDescriptionUpdate,
  taskUserAdd,
  taskAttachmentUpload,
  taskAttachmentDelete,
  taskLableAdd,
  addComment,
  deleteComment,
  getAttachmentById,
  getTaskById,
  getCommentById,
  taskImageUpdate,
  getAllTasksByColumnId,
  taskDND,
  updateTaskName,
};
