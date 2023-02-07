import User from "../Models/User.js";

export const getUsers = async (req, res) => {
  const { username } = req.query;
  try {
    const users = await User.find(
      { $text: { $search: username, $caseSensitive: false } },
      {
        _id: 1,
        username: 1,
        profileImage: 1,
      }
    );
    if (users.length === 0) {
      return res.status(404).send({
        message: "Users Not Found!",
      });
    }
    return res.status(200).send({
      users,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
};
