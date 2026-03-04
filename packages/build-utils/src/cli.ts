import {
  ArcaneFrontendBuildOptions,
  buildArcaneFrontend,
  watchArcaneFrontend,
} from './index';

type CliArgs = ArcaneFrontendBuildOptions & { watch: boolean };

const printHelp = () => {
  process.stdout.write(`arcane-build-frontend\n\n`);
  process.stdout.write(`Required:\n`);
  process.stdout.write(`  --entry <path>        Entrypoint file to bundle\n`);
  process.stdout.write(`  --outfile <path>      Output JS file path\n\n`);
  process.stdout.write(`Optional:\n`);
  process.stdout.write(
    `  --condition <name>    Additional module resolution condition (repeatable)\n`,
  );
  process.stdout.write(`  --watch               Rebuild on file changes\n`);
  process.stdout.write(`  --sourcemap           Enable sourcemaps (default)\n`);
  process.stdout.write(`  --no-sourcemap        Disable sourcemaps\n`);
  process.stdout.write(`  --minify              Minify output\n`);
  process.stdout.write(
    `  --no-react-compiler   Disable React Compiler transform\n`,
  );
  process.stdout.write(`  --help                Show this message\n`);
};

const requireValue = (argName: string, value?: string): string => {
  if (!value) {
    throw new Error(`Missing value for ${argName}`);
  }
  return value;
};

const parseArgs = (argv: string[]): CliArgs => {
  const parsed: CliArgs = {
    entry: '',
    outfile: '',
    conditions: [],
    sourcemap: true,
    minify: false,
    reactCompiler: true,
    watch: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--entry':
        parsed.entry = requireValue('--entry', argv[++i]);
        break;
      case '--outfile':
        parsed.outfile = requireValue('--outfile', argv[++i]);
        break;
      case '--condition':
        parsed.conditions?.push(requireValue('--condition', argv[++i]));
        break;
      case '--watch':
        parsed.watch = true;
        break;
      case '--sourcemap':
        parsed.sourcemap = true;
        break;
      case '--no-sourcemap':
        parsed.sourcemap = false;
        break;
      case '--minify':
        parsed.minify = true;
        break;
      case '--react-compiler':
        parsed.reactCompiler = true;
        break;
      case '--no-react-compiler':
        parsed.reactCompiler = false;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        return parsed;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!parsed.entry) {
    throw new Error('Missing required --entry argument');
  }
  if (!parsed.outfile) {
    throw new Error('Missing required --outfile argument');
  }

  return parsed;
};

const run = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.watch) {
    await watchArcaneFrontend(args);
    process.stdout.write('Watching for frontend changes...\n');
    return;
  }

  await buildArcaneFrontend(args);
};

run().catch((err) => {
  const message = err instanceof Error ? err.stack ?? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
