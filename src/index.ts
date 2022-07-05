#!/usr/bin/env node
import { Deployment } from '@metacall/protocol/deployment';
import { Plans } from '@metacall/protocol/plan';
import API from '@metacall/protocol/protocol';
import { promises as fs } from 'fs';
import args from './cli/args';
import { inspect } from './cli/inspect';
import { error, info, warn } from './cli/messages';
import { listSelection, planSelection } from './cli/selection';
import { del } from './delete';
import { deployFromRepository, deployPackage } from './deploy';
import { startup } from './startup';

enum ErrorCode {
	Ok = 0,
	NotDirectoryRootPath = 1,
	EmptyRootPath = 2,
	NotFoundRootPath = 3,
	AccountDisabled = 4
}

void (async () => {
	const config = await startup(args['confDir']);
	const api = API(config.token as string, config.baseURL);

	if (args['inspect']) return await inspect();

	if (args['delete']) {
		try {
			const deployments: Deployment[] = (await api.inspect()).filter(
				dep => dep.status === 'ready'
			);
			if (!deployments.length) error('No deployment found');

			const project: string = await listSelection(
				[...deployments.map(el => `${el.suffix} ${el.version}`)],
				'Select the deployment to delete:'
			);

			const app = deployments.filter(
				dep =>
					dep.suffix === project.split(' ')[0] &&
					dep.version === project.split(' ')[1]
			)[0];

			return await del(app.prefix, app.suffix, app.version);
		} catch (err) {
			error(String(err));
		}
	}

	// TODO: We should cache the plan and ask for it only once
	const plan = async (): Promise<Plans> => {
		const availPlans: string[] = Object.keys(await api.listSubscriptions());

		if (!availPlans.length) {
			const deployedAppsCount = (await api.listSubscriptionsDeploys())
				.length;

			if (!deployedAppsCount) {
				info(
					'There are no active plans associated with your account. Please purchase a new plan at https://dashboard.metacall.io.'
				);
				return process.exit(ErrorCode.Ok);
			} else {
				info(
					'Every plan on your account has apps installed on it. A new plan can be purchased at https://dashboard.metacall.io.'
				);
				warn(
					'Use the --force flag when wiring the preceding command if you still wished to deploy.'
				);
				warn(
					'Be aware that —force will arbitrarily destroy apps and continue the deployment process.'
				);
				return process.exit(ErrorCode.Ok);
			}
		}

		return (
			args['plan'] ||
			(await planSelection(
				'Please select plan from the list',
				availPlans
			))
		);
	};

	if (args['addrepo']) {
		try {
			return await deployFromRepository(
				config,
				await plan(),
				new URL(args['addrepo']).href
			);
		} catch (e) {
			error(String(e));
		}
	}

	// If workdir is passed call than deploy using package
	if (args['workdir']) {
		const rootPath = args['workdir'];

		try {
			if (!(await fs.stat(rootPath)).isDirectory()) {
				error(`Invalid root path, ${rootPath} is not a directory.`);
				return process.exit(ErrorCode.NotDirectoryRootPath);
			}
		} catch (e) {
			error(`Invalid root path, ${rootPath} not found.`);
			return process.exit(ErrorCode.NotFoundRootPath);
		}

		try {
			await deployPackage(rootPath, config, await plan());
		} catch (e) {
			error(String(e));
		}
	}

	if (args['serverUrl']) {
		config.baseURL = args['serverUrl'];
	}
})();
