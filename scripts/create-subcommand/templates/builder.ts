import type { CreateSubcommandArgs } from "../create-subcommand.type"

export default ({ name }: CreateSubcommandArgs): string => {
	return (
		`

	// ${name}
	.addSubcommand(subCommand => subCommand
		.setName("${name}")
		.setDescription(""))`
	)
}