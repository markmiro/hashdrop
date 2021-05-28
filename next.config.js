// https://blog.fleek.co/posts/fleek-nextJS
module.exports = {
  exportTrailingSlash: true,
  exportPathMap: function () {
    return {
      "/": { page: "/" },
    };
  },
};
