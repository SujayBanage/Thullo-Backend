import User from "../Models/User.js";
import Board from "../Models/Board.js";
import Column from "../Models/Columns.js";
import Task from "../Models/Task.js";
import Attachment from "../Models/Attachment.js";
import Comment from "../Models/Comments.js";
const checkUserExists = async (user_id, email) => {
  try {
    const user = user_id
      ? await User.findById(user_id)
      : await User.findOne({ email });
    if (!user) {
      return { exists: false, user: null };
    }
    return { exists: true, user };
  } catch (err) {
    return { exists: null, user: null, err: err.message };
  }
};

const checkBoardExists = async (board_id) => {
  try {
    const board = await Board.findById(board_id);
    if (!board) {
      return { exists: false, board: null, err: null };
    }
    return { exists: true, board, err: null };
  } catch (err) {
    return { exists: null, board: null, err: err.message };
  }
};

const checkColumnExists = async (column_id) => {
  try {
    const column = await Column.findById(column_id);
    if (!column) {
      return { exists: false, column: null, err: null };
    }
    return { exists: true, column, err: null };
  } catch (err) {
    return { exists: null, column: null, err: err.message };
  }
};
const checkTaskExists = async (task_id) => {
  try {
    const task = await Task.findById(task_id);
    if (!task) {
      return { exists: false, task: null, err: null };
    }
    return { exists: true, task, err: null };
  } catch (err) {
    return { exists: null, task: null, err: err.message };
  }
};
const checkAttachmentExists = async (attachment_id) => {
  try {
    const attachment = await Attachment.findById(attachment_id);
    if (!attachment) {
      return { exists: false, attachment: null, err: null };
    }
    return { exists: true, attachment, err: null };
  } catch (err) {
    return { exists: null, attachment: null, err: err.message };
  }
};

const checkCommentExists = async (comment_id) => {
  try {
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return { exists: false, comment: null, err: null };
    }
    return { exists: true, comment, err: null };
  } catch (err) {
    return { exists: false, comment: null, err: err.message };
  }
};

export {
  checkBoardExists,
  checkColumnExists,
  checkUserExists,
  checkTaskExists,
  checkAttachmentExists,
  checkCommentExists,
};
