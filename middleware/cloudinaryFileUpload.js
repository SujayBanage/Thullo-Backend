import cloudinary from "../utils/cloudinary.js";

export const cloudinaryProfileUpload = async (req, res, next) => {
  try {
    console.log("body from cloudinary middleware : ", req.body);
    const { profileImage } = req.body;
    const result = await cloudinary.uploader.upload(profileImage, {
      folder: "profile_pics",
      height: 50,
      width: 50,
      crop: "fill",
    });
    console.log("cloudinary file upload result : ", result);
    req.image_public_id = result.public_id;
    req.image_url = result.secure_url;
    return next();
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
};

export const cloudinaryBoardCoverUpload = async (req, res, next) => {
  try {
    console.log("board cover running!!!", req.body);
    const { boardCoverImage } = req.body;

    if (!boardCoverImage) {
      return res.status(400).send({
        message: "Please Provide The Cover image!",
      });
    }

    const result = await cloudinary.uploader.upload(boardCoverImage, {
      folder: "board_cover_pics",
      height: 130,
      width: 220,
      crop: "fill",
    });
    console.log("cloudinary file upload result : ", result);
    req.board_img_public_id = result.public_id;
    req.board_img_url = result.secure_url;
    return next();
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
};

export const cloudinaryAttachmentUpload = async (req, res, next) => {
  try {
    const { attachment } = req.body;
    console.log("attachment is : ", attachment.name);
    const result = await cloudinary.uploader.upload(attachment, {
      folder: "attachments",
    });
    console.log("cloudinary file upload result : ", result);
    req.attachment_public_key = result.public_id;
    req.attachment_url = result.secure_url;
    req.attachment_name = attachment.name;
    return next();
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
};

export const cloudinaryAttachmentDelete = async (req, res, next) => {
  try {
    const { cloudinary_id } = req.body;
    const result = await cloudinary.uploader.destroy(cloudinary_id);
    console.log("cloudinary delete result : ", result);
    return next();
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
};
