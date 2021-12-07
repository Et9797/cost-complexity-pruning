var cy = window.cy = cytoscape({

  container: document.querySelector('#cy'),

  boxSelectionEnabled: false,
  autoungrabify: true,
  wheelSensitivity: 0.1,

  layout: {
    name: 'dagre'
  },

  style: [
    {
      selector: 'node',
      style: {
        'font-size': '250%',
        'content': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': 'white',
        'border-color': '#11479e',
        'border-width': 20,
        'width': '900%',
        'height': '900%'
      }
    },

    {
      selector: ':parent',
      style: {
        'border-width': '0px',
        'padding': '0px',
        'text-valign': 'top',
      }
    },

    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'width': '60%',
        'target-arrow-shape': 'triangle',
        'line-color': '#11479e',
        'target-arrow-color':'#11479e'
      }
    },

    {
      selector: '.green-outline',
      style: {
        'line-color': '#228b22' ,
        'target-arrow-color': '#228b22',
        'border-width': 50,
        'border-color':'#228b22' 
      }
    },

    {
      selector: '.red-outline',
      style: {
        'border-width': 50,
        'border-color': 'red'
      }
    },

    {
      selector: '.fade-out-node',
      style: {
        'opacity': 0,
        'transition-property': 'opacity',
        'transition-duration': '0.2s'
      } 
    }

  ],

  elements: {
    nodes: [
      { data: { id: '100|100', parent: 't0'} },
      { data: { id: 't0'} },
      { data: { id: '80|70', parent: 't1'} },
      { data: { id: 't1'} },
      { data: { id: '40|15', parent: 't2' } },
      { data: { id: 't2'} },
      { data: { id: '38|0', parent: 't3' } },
      { data: { id: 't3' } },
      { data: { id: '2|15', parent: 't4' } },
      { data: { id: 't4' } },
      { data: { id: '60|35', parent: 't5' } },
      { data: { id: 't5' } },
      { data: { id: '50|22', parent: 't6' } },
      { data: { id: 't6' } },
      { data: { id: '50|0', parent: 't7' } },
      { data: { id: 't7' } },
      { data: { id: '0|22', parent: 't8' } },
      { data: { id: 't8' } },
      { data: { id: '10|13', parent: 't9' } },
      { data: { id: 't9' } },
      { data: { id: '30|20', parent: 't10' } },
      { data: { id: 't10' } },
      { data: { id: '30|8', parent: 't11' } },
      { data: { id: 't11' } },
      { data: { id: '30|0', parent: 't12' } },
      { data: { id: 't12' } },
      { data: { id: '0|8', parent: 't13' } },
      { data: { id: 't13' } },
      { data: { id: '0|12', parent: 't14' } },
      { data: { id: 't14' } },
    ],
    edges: [
      { data: { id: "t0t1", source: '100|100', target: '80|70' } },
      { data: { id: "t0t10", source: '100|100', target: '30|20' } },
      { data: { id: "t1t2", source: '80|70', target: '40|15' } },
      { data: { id: "t1t5", source: '80|70', target: '60|35' } },
      { data: { id: "t2t3", source: '40|15', target: '38|0' } },
      { data: { id: "t2t4", source: '40|15', target: '2|15' } },
      { data: { id: "t5t6", source: '60|35', target: '50|22' } },
      { data: { id: "t5t9", source: '60|35', target: '10|13' } },
      { data: { id: "t6t7", source: '50|22', target: '50|0' } },
      { data: { id: "t6t8", source: '50|22', target: '0|22' } },
      { data: { id: "t10t11", source: '30|20', target: '30|8' } },
      { data: { id: "t10t14", source: '30|20', target: '0|12' } },
      { data: { id: "t11t12", source: '30|8', target: '30|0' } },
      { data: { id: "t11t13", source: '30|8', target: '0|8' } },
    ]
  }

})

// Controls resizing and refitting of the tree on the canvas
window.addEventListener('load', () => {
  cy.fit()
})

window.addEventListener("resize", () => {
  cy.resize()
  cy.fit()
})

// Controls animation speed
var animationSpeedMultiplier = 1

$("#slider").on("change", () => {
  const value = $("#slider").prop("value")
  switch (true) {
    case (value < 5):
      animationSpeedMultiplier = 2
      break
    case (value == 5):
      animationSpeedMultiplier = 1
      break
    case (value > 5):
      animationSpeedMultiplier = 1 / (value - 5 + 1) 
      break
  }
})

// Controls pausing and resuming
var paused = false

$("#reset-btn").on("click", () => window.location.reload())

$("#prune-btn").on("click", () => {

  main()

  $("#prune-btn").attr("disabled", true)
  $("#pause-btn").attr("disabled", false)
  
  $("#pause-btn").on("click", () => {
    
    paused = true
    
    $("#pause-btn").attr("disabled", true)
    $("#resume-btn").attr("disabled", false)

    $("#resume-btn").on("click", () => {

      paused = false
      
      $("#resume-btn").attr("disabled", true)
      $("#pause-btn").attr("disabled", false)
    })
  })

})

function timeout(ms) {

  return new Promise(resolve => setTimeout(resolve, ms))

}

async function main() {

  let done = false
  let k = 1
  const alphas = []
  while (!done) {

    if (cy.nodes().parent().length > 1) {

      // Update current subtree text
      const subtree = document.querySelector("#subtree")
      subtree.innerHTML = `Current subtree: <span style="font-size: 30px; color: #1711d0;">T<sub>${k}</sub></span>`
  
      // Start animation
      const internalNodes = highlightInternalNodes()

      await timeout(5000 * animationSpeedMultiplier) //5000
      while (paused) await timeout(1000)

      const g_internalNodes = []
      for (const node of internalNodes) {

        // Compute g (alpha) for a branch
        const branch = highlightBranch(node[0])
        const leafNodesBranch = branch.leaves()
        const noLeafNodes = leafNodesBranch.length
        const resubRootNodeBranch = Math.min(...node[0].id().split("|").map(x => Number(x)))
        const resubLeaves = []
        for (const leaf of leafNodesBranch.toArray()) {
          const resub = Math.min(...leaf.id().split("|").map(x => Number(x)))
          resubLeaves.push(resub)
        }
        const resubWholeBranch = resubLeaves.reduce((acc, curr) => acc + curr)
        const g = (( (resubRootNodeBranch / 200) - (resubWholeBranch / 200) ) / (noLeafNodes - 1)).toFixed(3)
        g_internalNodes.push([g, node[1]])

        // Place equation on the DOM for the current branch
        const eq = document.createElement("p")
        eq.innerHTML = `$$ g_{${k}} (${node[1].id()}) = \\frac{${resubRootNodeBranch}/200 - ${resubWholeBranch}/200}{${noLeafNodes} - 1} = ${g} $$`
        eq.setAttribute("style", "font-size: 18px;")
        eq.setAttribute("id", node[1].id())
        $(".eqs").append(eq)
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, eq])

        await timeout(5000 * animationSpeedMultiplier) //5000
        while (paused) await timeout(1000)

        branch.removeClass("green-outline")
        internalNodes.forEach(n => n[0].addClass("red-outline"))
      }

      const minAlpha = g_internalNodes.reduce((acc, curr) => {
        if (Number(curr[0]) < Number(acc[0])) {
          return curr
        }
        return acc
      })

      alphas.push(minAlpha[0])

      // Highlight lowest alpha
      internalNodes.forEach(n => n[0].removeClass("red-outline"))
      await timeout(2000 * animationSpeedMultiplier) //2000
      while (paused) await timeout(1000)
      const redBoxMinAlpha = document.querySelector(`#${minAlpha[1].id()}`)
      redBoxMinAlpha.setAttribute("style", "border: 3px solid red;")

      await timeout(3000) //5000
      while (paused) await timeout(1000)

      // Prune
      minAlpha[1].children().successors().addClass("fade-out-node")
      minAlpha[1].children().successors().parent().addClass("fade-out-node")
      await timeout(1000)
      while (paused) await timeout(1000)
      cy.remove(minAlpha[1].children().successors().parent())

      await timeout(3000 * animationSpeedMultiplier) //3000
      while (paused) await timeout(1000)
      
      const bestSubTreeAlpha = document.createElement("p")
      bestSubTreeAlpha.innerHTML = `$$ T_{${k}}: \\alpha \\in [ \\, ${alphas.lastIndexOf(minAlpha[0]) == 0 ? 0: alphas[alphas.lastIndexOf(minAlpha[0]) - 1]}, ${minAlpha[0]} ) \\, $$`
      bestSubTreeAlpha.setAttribute("style", "font-size: 18px;")
      $(".result").append(bestSubTreeAlpha)
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, bestSubTreeAlpha])

      $(".eqs").empty()

      k++
    }
    else {
      const finished = document.createElement("h4")
      finished.innerHTML = "Reached root node."
      finished.setAttribute("style", "font-size: 18px;")
      $(".eqs").append(finished)

      const subtree = document.querySelector("#subtree")
      subtree.innerHTML = `Current subtree: <span style="font-size: 30px; color: #1711d0;">Root</span>`

      await timeout(2000) //2000
      while (paused) await timeout(1000)
      const bestSubTreeAlpha = document.createElement("p")
      bestSubTreeAlpha.innerHTML = `$$ \\text{Root}: \\alpha \\in [ \\, ${alphas[alphas.length - 1]}, \\infty ) \\, $$`
      bestSubTreeAlpha.setAttribute("style", "font-size: 18px;")
      $(".result").append(bestSubTreeAlpha)
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, bestSubTreeAlpha])

      $("#pause-btn").attr("disabled", true)
      $("resume-btn").attr("disabled", true)

      done = true
    }
  } 

}
 
function highlightInternalNodes() {

  const internalNodes = []
  for (const parentNode of cy.nodes().parent().toArray()) {
    const childNode = parentNode.children()
    if (childNode.successors().nodes().length > 0) {
      // Then the node is not a leaf node, i.e. an internal node
      childNode.addClass("red-outline")
      internalNodes.push([childNode, parentNode])
    }
  }

  return internalNodes
  
}

function highlightBranch(node) {

  let collection = cy.collection()
  const successors = node.successors()
  collection = collection.union(node)
  collection = collection.union(successors)
  collection.addClass("green-outline")
  collection.removeClass("red-outline")

  return collection

}