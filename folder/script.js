$(".nav li").click(function () {
  if (!this.dataset.url) return;

  let path = this.dataset.url;
  let data = {};
  if (this.dataset.id) data.id = this.dataset.id;

  $.ajax({
    url: "/api/" + path,
    data: data,
    success: function (resp) {
      $(".inform > h1").text(resp.name);
      $("#text").html(resp.description);
      $('#image').prop('src', resp.image);
    },
  });
});