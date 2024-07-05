# K6 output to Github Action Summary

## Inputs

### `k6-output-file`

**Required** JUnit file to generate the summary from.

## Example usage

```yaml
uses: actions/k6-to-summary
with:
  k6-output: 'path/to/k6.xml'
```

# Important

After changes make sure to run 
```shell 
npm i -g @vercel/ncc && ncc build src/index.js --license licenses.txt
```