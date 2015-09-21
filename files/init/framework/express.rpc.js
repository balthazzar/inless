import plugins from 'plugins';
import express from 'express';
import Logger from 'logger';
import Session from 'plugins/session.js';

var logger = Logger.getLogger('express.rpc');

var xRouter = express.Router();
var router = express.Router();

router.post('/:plugin/:method', (req, res, next)=> {
	var session = new Session(req.session);
	if(plugins[req.params.plugin] && plugins[req.params.plugin][req.params.method]) {
		logger.info(`${req.params.plugin}.${req.params.method}`, req.body||req.query||{});
		plugins[req.params.plugin][req.params.method](req.body||req.query||{}, session).then((data)=> {
			session = session.export();
			req.session.account = session.account;
			req.session.data = session.data;
			req.session.storage = session.storage;
			res.json({
				error: null,
				response: data
			});
		}).catch((error)=> {
			session = session.export();
			req.session.account = session.account;
			req.session.data = session.data;
			req.session.storage = session.storage;
			logger.error(error);
			res.json({
				error: error,
				response: null
			});
		});
	} else {
		logger.warn('Error: not fond method:', req.params);
		res.json({
			error: 'not fond method',
			response: null
		});
	}
});

xRouter.use('/rpc', router);

module.exports = xRouter;
