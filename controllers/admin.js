const Product = require("../models/Product");

const getAdminProducts = async (req, res, next) => {
  const admin = req.user;
  const products = await admin.getProducts();

  res.render("admin/products", {
    prods: products,
    docTitle: "Admin products",
    myActivePath: "/admin/products",
  });
};

const getAddProduct = (req, res, next) => {
  res.render("admin/add-or-edit-product", {
    myActivePath: "on-admin-page",
    docTitle: "Add product",
    editing: false,
  });
};

const getEditProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const admin = req.user;
  const [product = null] = await admin.getProducts({ where: { id: prodId } });

  if (!product) {
    // end middleware, hopefully 404 will run ahead
    next();
    return;
  }

  res.render("admin/add-or-edit-product", {
    myActivePath: "/admin/edit-product",
    docTitle: "Edit product",
    prod: product,
    editing: true,
  });
};

const postAddProduct = async (req, res, next) => {
  const user = req.user;
  await user.createProduct({
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    description: req.body.description,
    price: req.body.price,
  });

  res.redirect("/");
};

const postEditProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const admin = req.user;
  const [product = null] = await admin.getProducts({ where: { id: prodId } });

  if (!product) {
    // end middleware, hopefully 404 will run ahead
    next();
    return;
  }

  await product.update({
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    description: req.body.description,
    price: req.body.price,
  });

  res.redirect("/");
};

const deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const admin = req.user;

  const productOwnedByAdmin = await admin.hasProduct(prodId);

  if (productOwnedByAdmin) {
    await admin.removeProduct(prodId); // dissociate
    await Product.destroy({ where: { id: prodId } }); // destroy

    // FIXME: how know if operation succeeeded or not in Sequelize
  }

  if (productOwnedByAdmin) res.redirect("/");
  else {
    // 404 page
    next();
    return;
  }
};

const deleteAllProducts = async (req, res, next) => {
  const admin = req.user;
  await admin.setProducts([]);

  res.redirect("/");
};

module.exports = {
  getAdminProducts,
  getAddProduct,
  postAddProduct,
  deleteAllProducts,
  getEditProduct,
  postEditProduct,
  deleteProduct,
};
