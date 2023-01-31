import { ErrorCode } from './deploy';

const helpText = `
Official CLI for metacall-deploy

  Usage: metacall-deploy [--args]

Options
  Alias   Flag                 Accepts      Description
  -h      --help               string       Prints a user manual to assist you in using the CLI.
  -v      --version            nothing      Prints current version of the CLI.
  -a      --addrepo            string       Deploy from repository.
  -w      --workdir            string       Accepts path to application directory.
  -d      --dev                nothing      Run CLI in dev mode (deploy locally to metacall/faas).
  -n      --projectName        string       Accepts name of the application.
  -e      --email              string       Accepts email id for authentication.
  -p      --password           string       Accepts password for authentication.
  -t      --token              string       Accepts token for authentication, either pass email & password or token.
  -f      --force              nothing      Accepts boolean value: it deletes the deployment present on an existing plan and deploys again.
  -P      --plan               string       Accepts type of plan: "Essential", "Standard", "Premium".
  -i      --inspect            string       Lists out all the deployments with specifications (it defaults to Table format, otherwise they are serialized into specified format: Table | Raw | OpenAPI).
  -D      --delete             nothing      Accepts boolean value: it provides you all the available deployment options to delete.
  -l      --logout             nothing      Accepts boolean value: use it in order to expire your current session.
  -r      --listPlans          nothing      Accepts boolean value: list all the plans that are offered in your account using it.
  -u      --serverUrl          string       Change the base URL for the FaaS.
  -c      --confDir            string       (TODO) Overwrite the default configuration directory.`;

export const printHelp = (): void => {
	console.log(helpText);
	return process.exit(ErrorCode.Ok);
};
