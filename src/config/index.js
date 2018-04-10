const config = {
  password_default : '',
  update_check_interval : 86400000, // 1 day

};

module.exports = key => {
  if (key in config) {
    return config[key];
  } else {
    throw `The given key "${key}" to config was invalid`;
  }
};
