import Board from "../Models/Board.js";
import Column from "../Models/Columns.js";
import {
  checkBoardExists,
  checkColumnExists,
} from "../utils/checkExistance.js";
const createColumn = async (req, res) => {
  const { name, board_id } = req.body;
  const { exists, board } = await checkBoardExists(board_id);

  if (!exists) {
    return res.status(404).send({
      error: true,
      message: "Board Not Found!",
    });
  }

  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admin Can Create Column!",
    });
  }

  try {
    const column = await Column.create({
      name,
    });

    const boardUpdateResult = await Board.updateOne(
      { _id: board._id },
      {
        $push: {
          columns: {
            column_id: column._id,
            name: column.name,
          },
        },
      }
    );

    if (!column || !boardUpdateResult) {
      return res.status(500).send({
        error: true,
        message: "Column Creation Failed!",
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
    message: "Column Creation Successfull!",
  });
};
const updateColumnName = async (req, res) => {
  const { name, column_id, board_id } = req.body;
  const { column } = await checkColumnExists(column_id);
  const { board } = await checkBoardExists(board_id);

  if (!column || !board) {
    return res.status(404).send({
      message: "Board/Column Not Found!",
    });
  }

  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      message: "Only Admins Can Change Column Names!",
    });
  }

  try {
    const resultFromColumn = await Column.updateOne(
      { _id: column._id },
      { $set: { name } }
    );

    const resultFromBoard = await Board.updateOne(
      {
        $and: [
          {
            _id: board._id,
          },
          {
            "columns.column_id": column._id,
          },
        ],
      },
      { $set: { "columns.$.name": name } }
    );

    if (!resultFromBoard || !resultFromColumn) {
      return res.status(500).send({
        message: "Column Name Update Failed!",
      });
    }
    return res.status(200).send({
      message: "Column Rename Successfull!",
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
};

const deleteColumn = async (req, res) => {
  const { column_id, board_id } = req.body;
  console.log(req.body);
  const { column } = await checkColumnExists(column_id);
  const { board } = await checkBoardExists(board_id);

  if (!column || !board) {
    return res.status(404).send({
      error: true,
      message: "Board/Column Not Found!",
    });
  }

  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Delete The Column",
    });
  }
  try {
    const resultFromColumn = await Column.deleteOne({
      _id: column._id,
    });
    const resultFromBoard = await Board.updateOne(
      { _id: board._id },
      { $pull: { columns: { column_id: { $eq: column._id } } } }
    );
    if (!resultFromBoard || !resultFromColumn) {
      return res.status(500).send({
        message: "Column Deletion Failed!",
      });
    }
    return res.status(200).send({
      error: false,
      message: "Column Deletion Successfull!",
    });
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
};

export { createColumn, updateColumnName, deleteColumn };
