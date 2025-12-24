import {Router} from 'express';
import {getHome,getPredictions, getPredictionsinRange} from '../controllers/home.controllers.js';
const router = Router();

router.route('/').get(getHome); // is this even needed
router.route('/prediction').post(getPredictions); // for now this just returns user ka problem details
router.route('/prediction/range').post(getPredictionsinRange);
export default router;