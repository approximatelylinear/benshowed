<script>
  import Bencode from '../js/bencode';

  let inputText = '';
  let bencodeResults = [];
  let examples = [
    'ie',
    'i15e',
    'le',
    'li15ee',
    'li15ei15ee',
    'lli15eei15ee',
    '7:bencode',
    'l7:bencodei17eli34eee',
    'd3:bar4:spam3:fooi42ee',
    'd3:bar4:spam3:fooi42e1:ali23eee',
  ];

  const parse = (text) => {
    let parser = new Bencode();
    parser.parse(text);
    console.log(parser);
    return {
      parser: parser,
      inputText: text,
      parsedElems: parser.parsedElems,
      parsedText: JSON.stringify(parser.output, null, 2)
    };
  };

  const addParseText = (text) => {
    bencodeResults = [ parse(text), ...bencodeResults ];
  };

  const parseExamples = () => {
    examples.reverse().forEach(e => addParseText(e));
  };
  parseExamples();

  $: {
    bencodeResults;
  }

</script>

<style>
	.parser {
		padding: 1em;
		margin-bottom: 1em;
		border: 1px solid darkcyan;
		width: fit-content;
		box-shadow: 0 8px 6px -6px #636064;
		border-radius: 5px;
	}

	.results {
		padding: 1em;
		margin-bottom: 1em;
		border: 1px solid darkslategray;
		/* width: fit-content; */
		box-shadow: 0 8px 6px -6px #4a4e50;
		border-radius: 5px;
	}

  .number {
    font-size: medium;
    color: darkblue;
    text-decoration: underline;
  }

  .list {
    font-size: medium;
    color: darkgreen;
    text-decoration: underline;
  }

  .string {
    font-size: medium;
    color: purple;
    text-decoration: underline;
  }


  .token {
    background-color: lightblue;
    box-shadow: 0 1px 1px 1px darkblue;
    border-radius: 2px;
    margin-left: 1px;
    margin-right: 1px;
    padding: 1px 3px 1px 3px;
  }

  dl {
    list-style: none;
    padding: 0;
  }

  dd {
    border-bottom: 1px solid #eee;
    padding: 1px 3px 1px 3px;
    margin: 5px 1px 1px 1px;
  }


</style>

<div>
  <div class="parser">
    <h1>Bencode parser</h1>
    <label for="parsetext">I wanna parse:</label>
    <input id="parsetext" bind:value={inputText} placeholder="enter some text to parse" >
    <button on:click="{() => addParseText(inputText)}">Parse</button>
  </div>
  {#if bencodeResults.length > 0 }
    {#each bencodeResults as results }
      <div class="results">
        <dl>
          <dd>
            Input: {results.inputText}
          </dd>
          <dd>
            Parsed: <pre>{results.parsedText}</pre>
          </dd>
        </dl>
        <dl>
          {#each results.parsedElems as elem, i}
            <dd>
              <span class="token">{elem.type}</span>
              <span class="{elem.type}"> { results.inputText.slice(elem.start, elem.stop) } </span>
            </dd>
          {/each}
        </dl>
     </div>
    {/each}
  {/if}
</div>
