// import express, { Request, Response } from 'express';
// import axios from 'axios';
// import dotenv from 'dotenv';
// import prisma from '../../utils/prisma';
// import { authenticateUser } from "../middleware/authMiddleware";

// dotenv.config();

// const paymentRouter = express.Router();

// paymentRouter.post('/create-checkout/basic/monthly', authenticateUser, async (req: Request, res: Response) => {

//     try {
//       const { email, userId, amount, type, billingCycle } = req.body;

//       const variantId = process.env.LEMON_SQUEEZY_LIVE_VARIANT_ID_BASIC_MONTHLY!;
//       const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

//       const existingSubscription = await prisma.subscription.findFirst({
//          where:{ userId },
//       });

//       if (existingSubscription) {
//         await prisma.subscription.update({
//           where: { id: existingSubscription.id },
//           data: {
//             planType: type,
//             amount: String(amount) ,
//             billingCycle:billingCycle,
//           },
//         });
//       } else{
//         await prisma.subscription.create({
//           data: {
//             userId,
//             email:email,   
//             planType: type,           
//             billingCycle:billingCycle,             
//             amount:String(amount) ,
//             periodStart:new Date(Date.now()),

//           },
//         });
//       }
     
//       const checkoutSessionPayload = {
//         data: {
//           type: 'checkouts',
//           attributes: {
//             custom_price: Number(amount) * 100, 
//             product_options: {
//               redirect_url: `https://www.infobeatlive.com/payment-success?User=${userId}`,
//               enabled_variants: [Number(variantId)], 
//             },
//             checkout_options: {
//               button_color: "#000000"
//             },
//             checkout_data: {
//               custom: {
//                 user_id: String(userId),
//                 email:email,
//                 plan_type: String(type),
//                 billing_cycle:billingCycle,
//                 amount: String(amount),
//               }
//             },
//             expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
//            // preview: false,
//             test_mode: false,
//           },
//           relationships: {
//             store: {
//               data: {
//                 type: 'stores',
//                 id: store_id,
//               }
//             },
//             variant: {
//               data: {
//                 type: 'variants',
//                 id: variantId,
//               }
//             }
//           }
//         }
//       };
      
   
//       const response = await axios.post(
//         'https://api.lemonsqueezy.com/v1/checkouts',
//         checkoutSessionPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.MAIN_API_KEY}`,
//             'Content-Type': 'application/vnd.api+json',
//             Accept: 'application/vnd.api+json',
//           }
//         }
//       );

//       const checkoutUrl = response.data?.data?.attributes?.url;

//        if (!checkoutUrl) {
//         console.log('Failed to generate checkout URL.');
//         throw new Error('Failed to generate checkout URL.');
//        }

//       res.json({ checkoutUrl });
//      } catch (error:any) {
//       console.log('Error creating checkout:', error.message);
//       res.status(500).json({ message:`Something went wrong creating the checkout ${error.message}` });
//      }

//   });


//   paymentRouter.post('/create-checkout/basic/yearly', authenticateUser, async (req: Request, res: Response) => {

//     try {
//       const { email, userId, amount, type, billingCycle } = req.body;

//       const variantId = process.env.LEMON_SQUEEZY_LIVE_VARIANT_ID_BASIC_YEARLY!;
//       const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

//       const existingSubscription = await prisma.subscription.findFirst({
//          where:{ userId },
//       });

//       if (existingSubscription) {
//         await prisma.subscription.update({
//           where: { id: existingSubscription.id },
//           data: {
//             planType: type,
//             amount: String(amount) ,
//             billingCycle:billingCycle,
//           },
//         });
//       } else{
//         await prisma.subscription.create({
//           data: {
//             userId,
//             email:email,   
//             planType: type,           
//             billingCycle:billingCycle,             
//             amount:String(amount) ,
//             periodStart:new Date(Date.now()),

//           },
//         });
//       }

//       const checkoutSessionPayload = {
//         data: {
//           type: 'checkouts',
//           attributes: {
//             custom_price: Number(amount) * 100, 
//             product_options: {
//               redirect_url: `https://www.infobeatlive.com/payment-success?user=${userId}`,
//               enabled_variants:[Number(variantId)], 
//             },
//             checkout_options: {
//               button_color: "#000000" 
//             },
//             checkout_data: {
//               custom: {
//                 user_id: String(userId),
//                 email:String(email),
//                 plan_type: String(type),
//                 billingCycle:String(billingCycle),
//                 amount: String(amount),
//               }
//             },
//             expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
//            // preview: false,
//             test_mode: false,
//           },
//           relationships: {
//             store: {
//               data: {
//                 type: 'stores',
//                 id:store_id,
//               }
//             },
//             variant: {
//               data: {
//                 type: 'variants',
//                 id:variantId,
//               }
//             }
//           }
//         }
//       };
   
//       const response = await axios.post(
//         'https://api.lemonsqueezy.com/v1/checkouts',
//         checkoutSessionPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.MAIN_API_KEY}`,
//             'Content-Type': 'application/vnd.api+json',
//             Accept: 'application/vnd.api+json',
//           }
//         }
//       );
 
 
//       const checkoutUrl = response.data?.data?.attributes?.url;

//       if (!checkoutUrl) {
//        console.log('Failed to generate checkout URL.');
//        throw new Error('Failed to generate checkout URL.');
//       }

//       res.json({ checkoutUrl });
//      } catch (error) {
//        console.log('Error creating checkout:', error);
//        res.status(500).json({ message: `Something went wrong creating the checkout ${error}` });
//      }

//   });

//   ///

  
// paymentRouter.post('/create-checkout/plus/monthly', authenticateUser, async (req: Request, res: Response) => {

//     try {
//       const { email, userId, amount, type, billingCycle } = req.body;

//       const variantId = process.env.LEMON_SQUEEZY_LIVE_VARIANT_ID_PLUS_MONTHLY!;
//       const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

//       const existingSubscription = await prisma.subscription.findFirst({
//          where:{ userId },
//       });

//       if (existingSubscription) {
//         await prisma.subscription.update({
//           where: { id: existingSubscription.id },
//           data: {
//             planType: type,
//             amount: String(amount) ,
//             billingCycle:billingCycle,
//           },
//         });
//       } else{
//         await prisma.subscription.create({
//           data: {
//             userId,
//             email:email,   
//             planType: type,           
//             billingCycle:billingCycle,             
//             amount:String(amount) ,
//             periodStart:new Date(Date.now()),

//           },
//         });
//       }
     
//       const checkoutSessionPayload = {
//         data: {
//           type: 'checkouts',
//           attributes: {
//             custom_price: Number(amount) * 100, 
//             product_options: {
//               redirect_url: `https://www.infobeatlive.com/payment-success?User=${userId}`,
//               enabled_variants: [Number(variantId)], 
//             },
//             checkout_options: {
//               button_color: "#000000"
//             },
//             checkout_data: {
//               custom: {
//                 user_id: String(userId),
//                 email:email,
//                 plan_type: String(type),
//                 billing_cycle:billingCycle,
//                 amount: String(amount),
//               }
//             },
//             expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
//            // preview: false,
//             test_mode: false,
//           },
//           relationships: {
//             store: {
//               data: {
//                 type: 'stores',
//                 id: store_id,
//               }
//             },
//             variant: {
//               data: {
//                 type: 'variants',
//                 id: variantId,
//               }
//             }
//           }
//         }
//       };
      
   
//       const response = await axios.post(
//         'https://api.lemonsqueezy.com/v1/checkouts',
//         checkoutSessionPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.MAIN_API_KEY}`,
//             'Content-Type': 'application/vnd.api+json',
//             Accept: 'application/vnd.api+json',
//           }
//         }
//       );

//       const checkoutUrl = response.data?.data?.attributes?.url;

//        if (!checkoutUrl) {
//         console.log('Failed to generate checkout URL.');
//         throw new Error('Failed to generate checkout URL.');
//        }

//       res.json({ checkoutUrl });
//      } catch (error:any) {
//       console.log('Error creating checkout:', error.message);
//       res.status(500).json({ message:`Something went wrong creating the checkout ${error.message}` });
//      }

//   });


//   paymentRouter.post('/create-checkout/plus/yearly', authenticateUser, async (req: Request, res: Response) => {

//     try {
//       const { email, userId, amount, type, billingCycle } = req.body;

//       const variantId = process.env.LEMON_SQUEEZY_LIVE_VARIANT_ID_PLUS_YEARLY!;
//       const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

//       const existingSubscription = await prisma.subscription.findFirst({
//          where:{ userId },
//       });

//       if (existingSubscription) {
//         await prisma.subscription.update({
//           where: { id: existingSubscription.id },
//           data: {
//             planType: type,
//             amount: String(amount) ,
//             billingCycle:billingCycle,
//           },
//         });
//       } else{
//         await prisma.subscription.create({
//           data: {
//             userId,
//             email:email,   
//             planType: type,           
//             billingCycle:billingCycle,             
//             amount:String(amount) ,
//             periodStart:new Date(Date.now()),

//           },
//         });
//       }

//       const checkoutSessionPayload = {
//         data: {
//           type: 'checkouts',
//           attributes: {
//             custom_price: Number(amount) * 100, 
//             product_options: {
//               redirect_url: `https://www.infobeatlive.com/payment-success?user=${userId}`,
//               enabled_variants:[Number(variantId)], 
//             },
//             checkout_options: {
//               button_color: "#000000" 
//             },
//             checkout_data: {
//               custom: {
//                 user_id: String(userId),
//                 email:String(email),
//                 plan_type: String(type),
//                 billingCycle:String(billingCycle),
//                 amount: String(amount),
//               }
//             },
//             expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
//            // preview: false,
//             test_mode: false,
//           },
//           relationships: {
//             store: {
//               data: {
//                 type: 'stores',
//                 id:store_id,
//               }
//             },
//             variant: {
//               data: {
//                 type: 'variants',
//                 id:variantId,
//               }
//             }
//           }
//         }
//       };
   
//       const response = await axios.post(
//         'https://api.lemonsqueezy.com/v1/checkouts',
//         checkoutSessionPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.MAIN_API_KEY}`,
//             'Content-Type': 'application/vnd.api+json',
//             Accept: 'application/vnd.api+json',
//           }
//         }
//       );
 
 
//       const checkoutUrl = response.data?.data?.attributes?.url;

//       if (!checkoutUrl) {
//        console.log('Failed to generate checkout URL.');
//        throw new Error('Failed to generate checkout URL.');
//       }

//       res.json({ checkoutUrl });
//      } catch (error) {
//        console.log('Error creating checkout:', error);
//        res.status(500).json({ message: `Something went wrong creating the checkout ${error}` });
//      }

//   });

//   ///


// paymentRouter.post('/create-checkout/pro/monthly', authenticateUser, async (req: Request, res: Response) => {

//     try {
//       const { email, userId, amount, type, billingCycle } = req.body;

//       const variantId = process.env.LEMON_SQUEEZY_LIVE_VARIANT_ID_PRO_MONTHLY!;
//       const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

//       const existingSubscription = await prisma.subscription.findFirst({
//          where:{ userId },
//       });


//       if (existingSubscription) {
//         await prisma.subscription.update({
//           where: { id: existingSubscription.id },
//           data: {
//             planType: type,
//             amount: String(amount) ,
//             billingCycle:billingCycle,
//           },
//         });
//       } else{
//         await prisma.subscription.create({
//           data: {
//             userId,
//             email:email,   
//             planType: type,           
//             billingCycle:billingCycle,             
//             amount:String(amount) ,
//             periodStart:new Date(Date.now()),

//           },
//         });
//       }

//       const checkoutSessionPayload = {
//         data: {
//           type: 'checkouts',
//           attributes: {
//             custom_price: Number(amount) * 100, 
//             product_options: {
//               redirect_url: `https://www.infobeatlive.com/payment-success?user=${userId}`,
//               enabled_variants: [Number(variantId)], 
//             },
//             checkout_options: {
//               button_color: "#000000" 
//             },
//             checkout_data: {
//               custom: {
//                 user_id: String(userId),
//                 email:email,
//                 plan_type: String(type),
//                 billing_cycle:billingCycle,
//                 amount: String(amount),
//               }
//             },
//             expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
//             test_mode: false,
//           },
//           relationships: {
//             store: {
//               data: {
//                 type: 'stores',
//                 id: store_id,
//               }
//             },
//             variant: {
//               data: {
//                 type: 'variants',
//                 id: variantId,
//               }
//             }
//           }
//         }
//       };
      
   
//       const response = await axios.post(
//         'https://api.lemonsqueezy.com/v1/checkouts',
//         checkoutSessionPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.MAIN_API_KEY}`,
//             'Content-Type': 'application/vnd.api+json',
//             Accept: 'application/vnd.api+json',
//           }
//         }
//       );

//       const checkoutUrl = response.data?.data?.attributes?.url;

//        if (!checkoutUrl) {
//         console.log('Failed to generate checkout URL.');
//         throw new Error('Failed to generate checkout URL.');
//        }

//       res.json({ checkoutUrl });
//      } catch (error:any) {
//       console.log('Error creating checkout:', error.message);
//       res.status(500).json({ message:`Something went wrong creating the checkout ${error.message}` });
//      }

//   });

//   paymentRouter.post('/create-checkout/pro/yearly', authenticateUser, async (req: Request, res: Response) => {

//     try {
//       const { email, userId, amount, type, billingCycle } = req.body;

//       const variantId = process.env.LEMON_SQUEEZY_LIVE_VARIANT_ID_PRO_YEARLY!;
//       const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;


//       const existingSubscription = await prisma.subscription.findFirst({
//          where:{ userId },
//       });

//       if (existingSubscription) {
//         await prisma.subscription.update({
//           where: { id: existingSubscription.id },
//           data: {
//             planType: type,
//             amount: String(amount) ,
//             billingCycle:billingCycle,
//           },
//         });
//       } else{
//         await prisma.subscription.create({
//           data: {
//             userId,
//             email:email,   
//             planType: type,           
//             billingCycle:billingCycle,             
//             amount:String(amount) ,
//             periodStart:new Date(Date.now()),

//           },
//         });
//       }
    
//       const checkoutSessionPayload = {
//         data: {
//           type: 'checkouts',
//           attributes: {
//             custom_price: Number(amount) * 100,
//             product_options: {
//               redirect_url: `https://www.infobeatlive.com/payment-success?user=${userId}`,
//               enabled_variants:[Number(variantId)], 
//             },
//             checkout_options: {
//               button_color: "#000000" 
//             },
//             checkout_data: {
//               custom: {
//                 user_id: String(userId),
//                 email:String(email),
//                 plan_type: String(type),
//                 billingCycle:String(billingCycle),
//                 amount: String(amount),
//               }
//             },
//             expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
//             test_mode: false,
//           },
//           relationships: {
//             store: {
//               data: {
//                 type: 'stores',
//                 id:store_id,
//               }
//             },
//             variant: {
//               data: {
//                 type: 'variants',
//                 id:variantId,
//               }
//             }
//           }
//         }
//       };
 
//       const response = await axios.post(
//         'https://api.lemonsqueezy.com/v1/checkouts',
//         checkoutSessionPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.MAIN_API_KEY}`,
//             'Content-Type': 'application/vnd.api+json',
//             Accept: 'application/vnd.api+json',
//           }
//         }
//       );
 
 
//       const checkoutUrl = response.data?.data?.attributes?.url;

//       if (!checkoutUrl) {
//        console.log('Failed to generate checkout URL.');
//        throw new Error('Failed to generate checkout URL.');
//       }

//       res.json({ checkoutUrl });
//      } catch (error) {
//        console.log('Error creating checkout:', error);
//        res.status(500).json({ message: `Something went wrong creating the checkout ${error}` });
//      }

//   });
  
// export default paymentRouter;



















import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../../utils/prisma';
import { authenticateUser } from "../middleware/authMiddleware";

dotenv.config();

const paymentRouter = express.Router();

paymentRouter.post('/create-checkout/basic/monthly', authenticateUser, async (req: Request, res: Response) => {

    try {
      const { email, userId, amount, type, billingCycle } = req.body;

      const variantId = process.env.LEMON_SQUEEZY_TEST_VARIANT_ID_BASIC_MONTHLY!;
      const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

      const existingSubscription = await prisma.subscription.findFirst({
         where:{ userId },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType: type,
            amount: String(amount) ,
            billingCycle:billingCycle,
          },
        });
      } else{
        await prisma.subscription.create({
          data: {
            userId,
            email:email,   
            planType: type,           
            billingCycle:billingCycle,             
            amount:String(amount) ,
            periodStart:new Date(Date.now()),

          },
        });
      }
     
      const checkoutSessionPayload = {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: Number(amount) * 100, 
            product_options: {
              redirect_url: `http://localhost:3000/payment-success?User=${userId}`,
              enabled_variants: [Number(variantId)], 
            },
            checkout_options: {
              button_color: "#000000"
            },
            checkout_data: {
              custom: {
                user_id: String(userId),
                email:email,
                plan_type: String(type),
                billing_cycle:billingCycle,
                amount: String(amount),
              }
            },
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
           // preview: false,
            test_mode: true,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: store_id,
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              }
            }
          }
        }
      };
      
   
      const response = await axios.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        checkoutSessionPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            'Content-Type': 'application/vnd.api+json',
            Accept: 'application/vnd.api+json',
          }
        }
      );

      const checkoutUrl = response.data?.data?.attributes?.url;

       if (!checkoutUrl) {
        console.log('Failed to generate checkout URL.');
        throw new Error('Failed to generate checkout URL.');
       }

      res.json({ checkoutUrl });
     } catch (error:any) {
      console.log('Error creating checkout:', error.message);
      res.status(500).json({ message:`Something went wrong creating the checkout ${error.message}` });
     }

  });


  paymentRouter.post('/create-checkout/basic/yearly', authenticateUser, async (req: Request, res: Response) => {

    try {
      const { email, userId, amount, type, billingCycle } = req.body;

      const variantId = process.env.LEMON_SQUEEZY_TEST_VARIANT_ID_BASIC_YEARLY!;
      const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

      const existingSubscription = await prisma.subscription.findFirst({
         where:{ userId },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType: type,
            amount: String(amount) ,
            billingCycle:billingCycle,
          },
        });
      } else{
        await prisma.subscription.create({
          data: {
            userId,
            email:email,   
            planType: type,           
            billingCycle:billingCycle,             
            amount:String(amount) ,
            periodStart:new Date(Date.now()),

          },
        });
      }

      const checkoutSessionPayload = {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: Number(amount) * 100, 
            product_options: {
              redirect_url: `http://localhost:3000/payment-success?user=${userId}`,
              enabled_variants:[Number(variantId)], 
            },
            checkout_options: {
              button_color: "#000000" 
            },
            checkout_data: {
              custom: {
                user_id: String(userId),
                email:String(email),
                plan_type: String(type),
                billingCycle:String(billingCycle),
                amount: String(amount),
              }
            },
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
           // preview: false,
            test_mode: true,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id:store_id,
              }
            },
            variant: {
              data: {
                type: 'variants',
                id:variantId,
              }
            }
          }
        }
      };
   
      const response = await axios.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        checkoutSessionPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            'Content-Type': 'application/vnd.api+json',
            Accept: 'application/vnd.api+json',
          }
        }
      );
 
 
      const checkoutUrl = response.data?.data?.attributes?.url;

      if (!checkoutUrl) {
       console.log('Failed to generate checkout URL.');
       throw new Error('Failed to generate checkout URL.');
      }

      res.json({ checkoutUrl });
     } catch (error) {
       console.log('Error creating checkout:', error);
       res.status(500).json({ message: `Something went wrong creating the checkout ${error}` });
     }

  });



paymentRouter.post('/create-checkout/plus/monthly', authenticateUser, async (req: Request, res: Response) => {

    try {
      const { email, userId, amount, type, billingCycle } = req.body;

      const variantId = process.env.LEMON_SQUEEZY_TEST_VARIANT_ID_PLUS_MONTHLY!;
      const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

      const existingSubscription = await prisma.subscription.findFirst({
         where:{ userId },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType: type,
            amount: String(amount) ,
            billingCycle:billingCycle,
          },
        });
      } else{
        await prisma.subscription.create({
          data: {
            userId,
            email:email,   
            planType: type,           
            billingCycle:billingCycle,             
            amount:String(amount) ,
            periodStart:new Date(Date.now()),

          },
        });
      }
     
      const checkoutSessionPayload = {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: Number(amount) * 100, 
            product_options: {
              redirect_url: `http://localhost:3000/payment-success?User=${userId}`,
              enabled_variants: [Number(variantId)], 
            },
            checkout_options: {
              button_color: "#000000"
            },
            checkout_data: {
              custom: {
                user_id: String(userId),
                email:email,
                plan_type: String(type),
                billing_cycle:billingCycle,
                amount: String(amount),
              }
            },
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
           // preview: false,
            test_mode: true,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: store_id,
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              }
            }
          }
        }
      };
      
   
      const response = await axios.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        checkoutSessionPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            'Content-Type': 'application/vnd.api+json',
            Accept: 'application/vnd.api+json',
          }
        }
      );

      const checkoutUrl = response.data?.data?.attributes?.url;

       if (!checkoutUrl) {
        console.log('Failed to generate checkout URL.');
        throw new Error('Failed to generate checkout URL.');
       }

      res.json({ checkoutUrl });
     } catch (error:any) {
      console.log('Error creating checkout:', error.message);
      res.status(500).json({ message:`Something went wrong creating the checkout ${error.message}` });
     }

  });


  paymentRouter.post('/create-checkout/plus/yearly', authenticateUser, async (req: Request, res: Response) => {

    try {
      const { email, userId, amount, type, billingCycle } = req.body;

      const variantId = process.env.LEMON_SQUEEZY_TEST_VARIANT_ID_PLUS_YEARLY!;
      const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

      const existingSubscription = await prisma.subscription.findFirst({
         where:{ userId },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType: type,
            amount: String(amount) ,
            billingCycle:billingCycle,
          },
        });
      } else{
        await prisma.subscription.create({
          data: {
            userId,
            email:email,   
            planType: type,           
            billingCycle:billingCycle,             
            amount:String(amount) ,
            periodStart:new Date(Date.now()),

          },
        });
      }

      const checkoutSessionPayload = {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: Number(amount) * 100, 
            product_options: {
              redirect_url: `http://localhost:3000/payment-success?user=${userId}`,
              enabled_variants:[Number(variantId)], 
            },
            checkout_options: {
              button_color: "#000000" 
            },
            checkout_data: {
              custom: {
                user_id: String(userId),
                email:String(email),
                plan_type: String(type),
                billingCycle:String(billingCycle),
                amount: String(amount),
              }
            },
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
           // preview: false,
            test_mode: true,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id:store_id,
              }
            },
            variant: {
              data: {
                type: 'variants',
                id:variantId,
              }
            }
          }
        }
      };
   
      const response = await axios.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        checkoutSessionPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            'Content-Type': 'application/vnd.api+json',
            Accept: 'application/vnd.api+json',
          }
        }
      );
 
 
      const checkoutUrl = response.data?.data?.attributes?.url;

      if (!checkoutUrl) {
       console.log('Failed to generate checkout URL.');
       throw new Error('Failed to generate checkout URL.');
      }

      res.json({ checkoutUrl });
     } catch (error) {
       console.log('Error creating checkout:', error);
       res.status(500).json({ message: `Something went wrong creating the checkout ${error}` });
     }

  });

paymentRouter.post('/create-checkout/pro/monthly', authenticateUser, async (req: Request, res: Response) => {

    try {
      const { email, userId, amount, type, billingCycle } = req.body;

      const variantId = process.env.LEMON_SQUEEZY_TEST_VARIANT_ID_PRO_MONTHLY!;
      const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;

      const existingSubscription = await prisma.subscription.findFirst({
         where:{ userId },
      });


      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType: type,
            amount: String(amount) , 
            billingCycle:billingCycle,
          },
        });
      } else{
        await prisma.subscription.create({
          data: {
            userId,
            email:email,   
            planType: type,           
            billingCycle:billingCycle,             
            amount:String(amount) ,
            periodStart:new Date(Date.now()),

          },
        });
      }

      const checkoutSessionPayload = {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: Number(amount) * 100, 
            product_options: {
              redirect_url: `http://localhost:3000/payment-success?user=${userId}`,
              enabled_variants: [Number(variantId)], 
            },
            checkout_options: {
              button_color: "#000000" 
            },
            checkout_data: {
              custom: {
                user_id: String(userId),
                email:email,
                plan_type: String(type),
                billing_cycle:billingCycle,
                amount: String(amount),
              }
            },
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
            test_mode: true,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: store_id,
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              }
            }
          }
        }
      };
      
  
      const response = await axios.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        checkoutSessionPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            'Content-Type': 'application/vnd.api+json',
            Accept: 'application/vnd.api+json',
          }
        }
      );

      const checkoutUrl = response.data?.data?.attributes?.url;

       if (!checkoutUrl) {
        console.log('Failed to generate checkout URL.');
        throw new Error('Failed to generate checkout URL.');
       }

      res.json({ checkoutUrl });
     } catch (error:any) {
      console.log('Error creating checkout:', error.message);
      res.status(500).json({ message:`Something went wrong creating the checkout ${error.message}` });
     }

  });

  paymentRouter.post('/create-checkout/pro/yearly', authenticateUser, async (req: Request, res: Response) => {

    try {
      const { email, userId, amount, type, billingCycle } = req.body;

      const variantId = process.env.LEMON_SQUEEZY_TEST_VARIANT_ID_PRO_YEARLY!;
      const store_id = process.env.LEMON_SQUEEZY_STORE_ID!;


      const existingSubscription = await prisma.subscription.findFirst({
         where:{ userId },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType: type,
            amount: String(amount) ,
            billingCycle:billingCycle,
          },
        });
      } else{
        await prisma.subscription.create({
          data: {
            userId,
            email:email,   
            planType: type,           
            billingCycle:billingCycle,             
            amount:String(amount) ,
            periodStart:new Date(Date.now()),

          },
        });
      }
    
      const checkoutSessionPayload = {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: Number(amount) * 100,
            product_options: {
              redirect_url: `http://localhost:3000/payment-success?user=${userId}`,
              enabled_variants:[Number(variantId)], 
            },
            checkout_options: {
              button_color: "#000000" 
            },
            checkout_data: {
              custom: {
                user_id: String(userId),
                email:String(email),
                plan_type: String(type),
                billingCycle:String(billingCycle),
                amount: String(amount),
              }
            },
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
            test_mode: true,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id:store_id,
              }
            },
            variant: {
              data: {
                type: 'variants',
                id:variantId,
              }
            }
          }
        }
      };
  
      const response = await axios.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        checkoutSessionPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            'Content-Type': 'application/vnd.api+json',
            Accept: 'application/vnd.api+json',
          }
        }
      );
 
 
      const checkoutUrl = response.data?.data?.attributes?.url;

      if (!checkoutUrl) {
       console.log('Failed to generate checkout URL.');
       throw new Error('Failed to generate checkout URL.');
      }

      res.json({ checkoutUrl });
     } catch (error) {
       console.log('Error creating checkout:', error);
       res.status(500).json({ message: `Something went wrong creating the checkout ${error}` });
     }

  });
  
export default paymentRouter;
