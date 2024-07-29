const router = require('express').Router();
const CategoryModel = require('../models/category1');
const OrderModel = require('../models/order');
const Passport = require('../modules/passport');
const ProductModel = require('../models/product');
const Danhmuc = require('../models/category1');
const ProductType = require('../models/product_type');
const Sanpham = require('../models/product');
const Loaisanpham = require('../models/product_type');
const Color = require('../models/color');
const Cart = require('../models/cart'); // Import the Cart model

/* GET home page. */
router.get('/', async (req, res) => {
  const model = {
    categories: [],
    products: [],
    user: req.user || null,
    cartItems: [],
    SL: 0,
    TT: 0
  };

  try {
    model.categories = await CategoryModel.find({ isDeleted: false }).lean();
    model.products = await ProductModel.find({ isDeleted: false }).lean();

    if (req.user) {
      model.cartItems = await Cart.find({ user_id: req.user.user_id }).lean();
      model.cartItems.forEach(item => {
        model.SL += item.quantitys;
        model.TT += parseInt(item.sanpham_gia.replace(/\D/g, '')) * item.quantitys;
      });
    }

    if (model.categories && model.categories.length > 0 && model.products && model.products.length > 0) {
      for (const x of model.categories) {
        x.counter = 0;
        for (const y of model.products) {
          if (y.categoryId === x.id) {
            x.counter += 1;
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
  
  res.render('site/index', model);
});

router.get('/danh-muc/:name.:id.html', async (req, res) => {
  const model = {
    categories: [],
    products: [],
    cartItems: [],
    SL: 0,
    TT: 0
  };

  try {
    model.categories = await CategoryModel.find({ isDeleted: false }).lean();
    model.products = await ProductModel.find({ categoryId: req.params.id, isDeleted: false }).lean();

    if (req.user) {
      model.cartItems = await Cart.find({ user_id: req.user.user_id }).lean();
      model.cartItems.forEach(item => {
        model.SL += item.quantitys;
        model.TT += parseInt(item.sanpham_gia.replace(/\D/g, '')) * item.quantitys;
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
  
  res.render('site/category', model);
});


router.get('/san-pham/:name.:productId.:categoryId.html', async (req, res) => {
  const model = {};

  try {
    model.data = await ProductModel.findOne({ id: req.params.productId, isDeleted: false }).lean();

    if (!model.data || !model.data.id) {
      return res.redirect('/');
    } else {
      model.products = await ProductModel.find({
        categoryId: model.data.categoryId,
        isDeleted: false,
        id: { $ne: model.data.id }
      }).limit(10).lean();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }

  res.render('site/product', model);
});

router.get('/product/:sanpham_id', async (req, res) => {
  try {
    const sanpham_id = parseInt(req.params.sanpham_id, 10);

    // Aggregation pipeline to fetch product details and related data
    const result = await Sanpham.aggregate([
      { $match: { sanpham_id } },
      {
        $lookup: {
          from: 'tbl_danhmuc',
          localField: 'danhmuc_id',
          foreignField: 'danhmuc_id',
          as: 'danhmuc'
        }
      },
      {
        $lookup: {
          from: 'tbl_loaisanpham',
          localField: 'loaisanpham_id',
          foreignField: 'loaisanpham_id',
          as: 'loaisanpham'
        }
      },
      {
        $lookup: {
          from: 'tbl_color',
          localField: 'color_id',
          foreignField: 'color_id',
          as: 'color'
        }
      },
      {
        $lookup: {
          from: 'tbl_sanpham_size',
          localField: 'sanpham_id',
          foreignField: 'sanpham_id',
          as: 'sanpham_sizes'
        }
      },
      {
        $lookup: {
          from: 'tbl_sanpham',
          let: { loaisanpham_id: '$loaisanpham_id', sanpham_id: '$sanpham_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$loaisanpham_id', '$$loaisanpham_id'] }, { $ne: ['$sanpham_id', '$$sanpham_id'] }] } } },
            { $limit: 5 }
          ],
          as: 'relatedProducts'
        }
      },
      {
        $lookup: {
          from: 'tbl_sanpham_anh',
          localField: 'sanpham_id',
          foreignField: 'sanpham_id',
          as: 'images'
        }
      },
      {
        $project: {
          sanpham_id: 1,
          sanpham_tieude: 1,
          sanpham_ma: 1,
          sanpham_gia: 1,
          sanpham_chitiet: 1,
          sanpham_baoquan: 1,
          sanpham_anh: 1,
          images: { $ifNull: ['$images.sanpham_anh', []] },
          danhmuc: { $arrayElemAt: ['$danhmuc', 0] },
          loaisanpham: { $arrayElemAt: ['$loaisanpham', 0] },
          color: { $arrayElemAt: ['$color', 0] },
          sanpham_sizes: 1, // Include the sanpham_sizes field
          relatedProducts: 1
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).send('Product not found');
    }

    const [sanpham] = result;

    const model = {
      user: req.user,
      sanpham,
      danhmuc: sanpham.danhmuc,
      loaisanpham: sanpham.loaisanpham,
      color: sanpham.color,
      relatedProducts: sanpham.relatedProducts,
      session_id: req.session.id,
      cartItems: req.user ? await Cart.find({ user_id: req.user.user_id }).lean() : [],
      SL: 0,
      TT: 0
    };

    if (model.cartItems.length > 0) {
      model.cartItems.forEach(item => {
        model.SL += item.quantitys;
        model.TT += parseInt(item.sanpham_gia.replace(/\D/g, '')) * item.quantitys;
      });
    }

    res.render('site/product', model);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
