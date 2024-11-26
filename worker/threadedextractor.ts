import { parentPort } from 'node:worker_threads'
import { extract } from '../export/extract.ts'
import { HASHES_32, loadHashesFromTables, loadHashesTable } from '../hashes.ts'

export interface ThreadedExtractorParameter {
	filepath: string
	clean?: boolean
	convert?: boolean
	keep_original?: boolean
	hashes: [Record<string, string>, Record<string, string>]
}

export interface ThreadedExtractorResult {
	num_files: number
	error?: string
}

parentPort?.on('message', async (
	params: ThreadedExtractorParameter,
) => {
	await loadHashesFromTables(params.hashes)
	if (params == undefined) {
		return {
			num_files: 0,
			error: 'Invalid params',
		}
	}

	const num_files = await extract(
		params.filepath,
		params.clean,
		params.convert,
		params.keep_original,
	)

	parentPort?.postMessage({
		num_files,
	})
})
