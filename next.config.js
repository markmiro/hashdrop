// https://blog.fleek.co/posts/fleek-nextJS
module.exports = {
  trailingSlash: true,
  exportPathMap: function () {
    return {
      "/": { page: "/" },
    };
  },
};
