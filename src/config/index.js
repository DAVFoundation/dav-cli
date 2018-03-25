const config = {
  password_default: ''
};

module.exports = key => {
  if (key in config) {
    return config[key];
  } else {
    throw `The given key "${key}" to config was invalid`;
  }
};
