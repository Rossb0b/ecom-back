const stripe = require('stripe')('sk_test_51H3ja9IHs9TQroDdeeKIClXfclhslLl64QfWbZYSQbFOaTYwFLCZaBIiihrKdK7KprkOb132Bga2UpcbG1Jy6Sen001SBJmMBA');
const Bucket = require('../models/bucket');

/**
 * Method to fetch the client secret and the value for a new intent of payment
 * @returns {json{e<string>, json{clientSecret, totalValue<Number>} if success}}
 */
exports.getClientSecretAndValue = async (req, res) => {
  
  let commandPrice = 0;

  try {
  const bucket = await Bucket.findOne({ 'userId': req.userData.userId })
    .populate({
      path: 'products',
      populate: {
        path: 'product',
        model: 'Product',
        select: 'name price',
      }
    });

    // Loop through the products stored in the current Bucket to calcul the price of the product
    for (const product of bucket.products) {
      commandPrice += (product.volume * product.product.price);
    }
    commandPrice = Math.round(commandPrice * 100);

    const intent = await createPaymentIntent(commandPrice);
    res.status(200).json({
      clientSecret: intent.client_secret,
      totalValue: commandPrice / 100,
    });
  } catch (e) {
    res.status(404).json(e);
  }
};

/**
 * Method to create an intent payment
 * @returns {json{e<string>, json{amount<Number>, currency<string>} if success}}
 */
createPaymentIntent = async (commandPrice) => {
  return await stripe.paymentIntents.create({
    amount: commandPrice,
    currency: 'EUR',
    metadata: { integration_check: 'accept_a_payment' },
  });
};
