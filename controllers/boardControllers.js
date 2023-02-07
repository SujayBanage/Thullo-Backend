import Board from "../Models/Board.js";
import User from "../Models/User.js";
import Invite from "../Models/Invitation.js";
import { checkBoardExists } from "../utils/checkExistance.js";
import Column from "../Models/Columns.js";
import Task from "../Models/Task.js";
import Attachment from "../Models/Attachment.js";
import cloudinary from "../utils/cloudinary.js";

const updateBoardName = async (req, res) => {
  const { board_id, name } = req.body;
  const { exists, board } = await checkBoardExists(board_id);
  if (!board || !exists) {
    return res.status(404).send({
      error: true,
      message: "Board Not Found!",
    });
  }
  try {
    const result = await Board.updateOne(
      { _id: board._id },
      {
        $set: {
          name,
        },
      }
    );
    if (!result) {
      return res.status(500).send({
        error: true,
        message: "Board Name Update Failed!",
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
    message: "Board Name Upadate Successfull!",
  });
};

const getBoardUsersById = async (req, res) => {
  const { board_id } = req.params;
  const { exists, board } = await checkBoardExists(board_id);

  if (!board || !exists) {
    return res.status(404).send({
      error: true,
      message: "Board Not Found!",
    });
  }
  return res.status(200).send({
    error: false,
    users: board.users,
  });
};

const createBoard = async (req, res) => {
  console.log("create board running!");
  const { name, visibility } = req.body;
  if (!name || !visibility) {
    return res.status(400).send({
      error: true,
      message: "Please Provide More info!",
    });
  }
  let board;
  try {
    const admin = {
      user_id: req.user._id,
      username: req.user.username,
      profileImage: req.user.profileImage,
    };

    board = await Board.create({
      name,
      visibility,
      boardCoverImage: req.board_img_url,
      boardCoverImage_id: req.board_img_public_id,
      admin,
    });

    await User.findByIdAndUpdate(
      { _id: req.user._id },
      { $push: { Boards: board._id } }
    );
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
  return res.status(200).send({
    error: false,
    message: "board created successfully!",
  });
};

const getBoardInfo = async (req, res) => {
  const board_id = req.params.board_id;
  try {
    const board = await Board.findById({ _id: board_id });
    if (board) {
      return res.status(200).send({
        error: false,
        board,
      });
    }
    return res.status(404).send({
      error: true,
      message: "board not found!",
    });
  } catch (err) {
    return res.status(400).send({
      error: false,
      message: err.message,
    });
  }
};

const getAllBoards = async (req, res) => {
  try {
    console.log("get all boards running!!");

    const allBoards = await Board.find({
      $or: [
        {
          "admin.user_id": req.user._id,
        },
        {
          "users.user_id": req.user._id,
        },
        {
          visibility: "Public",
        },
      ],
    });
    console.log("all boards of user : ", req.user.username, "are ", allBoards);
    if (allBoards) {
      return res.status(200).send({
        error: false,
        allBoards,
      });
    }
    return res.status(404).send({
      error: true,
      message: "Boards Not Found!",
    });
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
};

const changeVisibility = async (req, res) => {
  const { visibility, board_id } = req.body;

  try {
    const result = await Board.findByIdAndUpdate(
      { _id: board_id },
      { $set: { visibility } }
    );
    if (!result) {
      return res.status(404).send({
        error: true,
        message: "board not found!",
      });
    }
    return res.status(200).send({
      error: false,
      message: "board visibility change successfull!",
    });
  } catch (err) {
    return res.status(500).send({
      error: false,
      message: err.message,
    });
  }
};

const inviteUser = async (req, res) => {
  const { board_id, invite_user_id, profileImage } = req.body;

  const inviteExists = await Invite.findOne({ board_id, to: invite_user_id });
  if (inviteExists) {
    return res.status(200).send({
      error: true,
      message: "Invite Already Exists!",
    });
  }

  let board;
  try {
    board = await Board.findById(board_id);
    if (!board) {
      return res.status(404).send({
        error: true,
        message: "Board Not Found!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Invite",
    });
  }

  let invite_user;
  try {
    invite_user = await User.findById(invite_user_id);
    if (!invite_user) {
      return res.status(404).send({
        error: true,
        message: "User Not Found!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  try {
    const Invitation = await Invite.create({
      from: req.user._id,
      fromProfileImage: profileImage,
      to: invite_user._id,
      message: `${req.user.username} invited you to board ${board.name}`,
      board_id: board._id,
    });

    if (!Invitation) {
      return res.status(500).send({
        error: true,
        message: "Invitation Failed!",
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
    message: "User Invited Successfully!",
  });
};

const getAllInvites = async (req, res) => {
  try {
    const allInvites = await Invite.find({
      to: req.user._id,
    });
    console.log("all invites are : ", allInvites);
    if (!allInvites || allInvites.length === 0) {
      return res.status(404).send({
        error: true,
        message: "Board Invites Not Found!",
      });
    }
    return res.status(200).send({
      allInvites,
    });
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
};

const updateDescription = async (req, res) => {
  const { board_id, description } = req.body;
  console.log(
    "description is : ",
    description,
    "type is : ",
    typeof description
  );
  let board;
  try {
    board = await Board.findById(board_id);
    if (!board) {
      return res.status(404).send({
        error: true,
        message: "Board Not Found!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Update Description!",
    });
  }

  try {
    const result = await Board.findByIdAndUpdate(
      { _id: board._id },
      { $set: { description } }
    );
    if (!result) {
      return res.status(500).send({
        error: true,
        message: "Error Updating Board!",
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
    message: "Board Description Updated Successfully!",
  });
};

const joinBoard = async (req, res) => {
  const { board_id, invitation_id } = req.body;
  let board;
  try {
    board = await Board.findById(board_id);
    if (!board) {
      return res.status(404).send({
        error: true,
        message: "Board Not Found!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  try {
    const userObj = {
      user_id: req.user._id,
      username: req.user.username,
      profileImage: req.user.profileImage,
    };

    const boardUpdateResult = await Board.updateOne(
      { _id: board._id },
      {
        $push: {
          users: userObj,
        },
      }
    );

    const userUpadteResult = await User.updateOne(
      {
        _id: req.user._id,
      },
      { $push: { Boards: board._id } }
    );

    const deleteInvite = await Invite.deleteOne({ _id: invitation_id });

    if (!boardUpdateResult || !userUpadteResult || !deleteInvite) {
      return res.status(500).send({
        error: true,
        message: "Join Board Failed!",
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
    message: "Join Board Successfull!",
  });
};
const removeUserFromBoard = async (req, res) => {
  const { user_id, board_id } = req.body;

  let board;
  try {
    board = await Board.findById(board_id);
    if (!board) {
      return res.status(404).send({
        error: true,
        message: "Board Not Found!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Remove Users!",
    });
  }

  let user;
  try {
    user = await User.findById(user_id);
    if (!user) {
      return res.status(404).send({
        error: true,
        message: "User Not Found!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  try {
    // const boardUpdatedResult = await Board.updateOne(
    //   { _id: board._id },
    //   {
    //     $pull: {
    //       users: {
    //         user_id: user._id,
    //         username: user.username,
    //         profileImage: user.profileImage,
    //       },
    //     },
    //   }
    // );

    let boardUsers = board.users;
    boardUsers = boardUsers.filter((boardUser) => {
      return !boardUser.user_id.equals(user._id);
    });

    const boardUpdatedResult = await Board.updateOne(
      { _id: board._id },
      { $set: { users: boardUsers } }
    );

    console.log("remove user from board : ", boardUpdatedResult);

    let userBoards = user.Boards;
    userBoards = userBoards.filter((board_id) => {
      return !board_id.equals(board._id);
    });

    // const userUpadateResult = await User.updateOne(
    //   { _id: user._id },
    //   { $pull: { Boards: board._id } }
    // );

    const userUpdateResult = await User.updateOne(
      { _id: user._id },
      { $set: { Boards: userBoards } }
    );

    console.log("remove board  from user : ", userUpdateResult);

    if (!boardUpdatedResult || !userUpdateResult) {
      return res.status(500).send({
        error: true,
        message: "User Remove failed!!",
      });
    }
  } catch (err) {
    return res.status(err).send({
      error: true,
      message: err.message,
    });
  }
  return res.status(200).send({
    error: false,
    message: "remove user successfull!",
  });
};

const deleteBoard = async (req, res) => {
  const { board_id } = req.body;
  const { board } = await checkBoardExists(board_id);

  if (!board.admin.user_id.equals(req.user._id)) {
    return res.status(403).send({
      error: true,
      message: "Only Admins Can Delete Board!",
    });
  }

  try {
    const resultFromBoard = await Board.deleteOne({ _id: board._id });
    const resultFromUser = await User.updateOne(
      { _id: req.user._id },
      { $pull: { Boards: board._id } }
    );

    const columnIds = board.columns.map((column) => column.column_id);

    await Column.deleteMany({ _id: { $in: columnIds } });

    columnIds.forEach(async (column_id) => {
      const task = await Task.findOne({ "column.column_id": column_id });
      console.log("task is : ", task);
      await Task.deleteOne({
        "column.column_id": column_id,
      });

      task.attachments.forEach(async (attachment_id) => {
        const attachment = await Attachment.findById(attachment_id);
        await cloudinary.uploader.destroy(attachment.public_key);
      });
      await Attachment.deleteMany({ _id: { $in: task.attachments } });
    });

    const board_cover_delete = await cloudinary.uploader.destroy(
      board.boardCoverImage_id
    );

    const resultFromColumn = await Column.deleteMany({
      _id: { $in: columnIds },
    });

    if (!resultFromBoard || !resultFromUser || !resultFromColumn) {
      return res.status(500).send({
        error: true,
        message: "Board Deletion Failed!",
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
    message: "Board Deletion Successfull!",
  });
};

const deleteInvitation = async (req, res) => {
  const { invite_id } = req.body;
  try {
    const result = await Invite.findByIdAndDelete({ _id: invite_id });
    if (!result) {
      return res.status(500).send({
        error: true,
        message: "Delete Invitation Failed!",
      });
    }
    return res.status(200).send({
      error: false,
      message: "Delete Invitation Successfull!",
    });
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
};

export {
  createBoard,
  getBoardInfo,
  getAllBoards,
  changeVisibility,
  inviteUser,
  getAllInvites,
  updateDescription,
  joinBoard,
  removeUserFromBoard,
  deleteBoard,
  deleteInvitation,
  getBoardUsersById,
  updateBoardName,
};
