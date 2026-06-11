'use client'

import {motion, useAnimationFrame} from 'framer-motion'
import {useEffect, useRef, useState} from 'react'

// ── Design tokens pulled directly from the Figma "landing_page" frame (79:244) ──
// The frame is a fixed 1185 × 786 stage; every element is positioned in that space
// and the whole stage is uniformly scaled to fit the viewport (desktop for now).
const STAGE_W = 1185
const STAGE_H = 786

// The wiggly bezier the "coming soon" text rides along — exact vectorPaths data
// from the TEXT_PATH node (83:526 / 79:257), in its own 1420 × 650 local space.
const WIGGLE_PATH =
  'M -300 117.32930421551146 L 0 117.32930421551146 C 10.659698537367 117.2461428357628 37.907730809005805 115.27373493085777 83.51666826344598 90.89587447749942 C 111.04342639256407 76.18289205179748 156.12399054469975 47.005016503426184 184.8726287034667 30.53500719084395 C 223.2154920281402 8.568495396556031 243.06993028939513 4.132173283523663 267.40683991335897 1.721556338790336 C 306.23025916480856 -2.123976375403241 333.39043706975576 1.2831083539691743 343.1281939645128 4.07433026093349 C 374.84493525167716 13.16558847177521 392.2046680039068 29.700834420087027 405.24718369598133 44.030736842768235 C 413.13900312484145 52.701533679614386 415.4468538328428 72.55792431492719 416.41112425636925 103.30865659168707 C 416.685155491946 112.0475553772676 401.9706099970085 136.79331980926884 378.1060896970577 176.20708991322817 C 367.4790619930909 193.75829993606888 357.9604427638474 205.1477138595116 338.91455714077415 227.6301883709065 C 319.8686715177009 250.11266288230138 291.09744105677754 283.03938203277545 273.53156792000215 305.19791365333674 C 255.96569478322672 327.35644527389803 250.47704120664469 337.74902214663985 244.01514232753172 353.5577164806552 C 229.18243507811417 389.8451518569749 220.96836928018658 421.69005264258016 218.05732715609932 443.6824572846774 C 212.33639822348482 486.90305829243476 221.94513569310104 501.08016195660457 229.24447619914088 512.0933748394121 C 238.07647503403774 525.4190563642716 261.56207012518973 531.630497005776 295.74352455679144 534.5536668530083 C 317.20004537802737 536.388610721582 356.86249756464974 534.5905890368443 380.47458139226137 535.2421379968097 C 422.46149195438807 536.4007196633255 437.41139953520934 546.7357866636967 447.98494409871637 555.0646821913524 C 466.5989461578349 569.7271333941648 473.23990222487555 595.7600443366946 487.52101884463883 618.6795102220229 C 502.73236311317294 643.0918782571842 522.4832815767683 645.6666345191994 539.9711518642284 648.692889667913 C 569.4326872724959 653.7911737121785 590.8085208791401 640.9350773719385 610.1377537134223 635.5460862250502 C 641.785491629587 626.7226947947607 653.7435723958075 625.9066694977397 673.3830860151404 619.9936669603006 C 697.904036076245 612.6109770205671 722.3196944522313 604.3482383455636 746.0695535856266 600.9437010729301 C 779.150093948362 596.2016124723267 801.7500305516165 598.9727051408372 809.7734892783179 601.1928620583059 C 823.1887809042047 604.9049832192927 835.8426621223001 610.1849122613156 855.4891055610534 613.4515164983943 C 894.2808401627216 619.9013990906689 926.9228531205902 621.4321807014584 939.4413574196699 621.2697561265983 C 953.8046589559034 621.0833957772037 970.0417447467512 611.6330086548625 979.56297463547 605.0925947016221 C 990.9544722750323 597.2674385210742 999.1432133124919 575.2398732637794 1007.646936828055 540.91694218115 C 1014.3341779270189 513.9257423217201 1021.2806670199317 466.46865276340753 1027.019038430379 436.96794138533016 C 1034.818789731898 396.8697686977718 1045.1765008609552 374.600535386807 1056.5359829116892 353.61559617188124 C 1070.0881093573375 328.580076547674 1079.7856228846883 323.1170269177623 1099.8698050762366 311.2154203289218 C 1115.2178529682062 302.12038101050075 1147.8351110957137 299.4963418945634 1194.8666530620828 299.1942518753677 C 1219.4680308933591 299.0362338593891 1240.5857379398185 313.2655368584348 1254.4956603522614 324.2950512531979 C 1259.1712530753368 328.0024419758916 1264.7639199099171 335.43199185257845 1274.986863666934 351.65594171988124 C 1285.2098074239507 367.87989158718403 1299.3420744413133 393.2804848872847 1312.4124288144674 413.8787561008084 C 1325.4827831876214 434.47702731433213 1337.0629684150842 449.50324465213225 1354.477520593948 468.5851590559031 C 1371.8920727728116 487.66707345967393 1394.7901287039338 510.34936144871523 1419.5159912109375 533.8843474244782 L 1854.2 947.7'

// One repeating text unit + how many copies we lay down along the path.
const UNIT = 'comingsoon'
const REPEAT = 40
const CRAWL_TEXT = UNIT.repeat(REPEAT)
const CRAWL_SECONDS = 20 // time to advance exactly one unit → perfectly seamless loop

export default function Page() {
  const [scale, setScale] = useState(1)

  // Fit the fixed 1185×786 stage into the viewport, preserving aspect ratio.
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // Seamless crawl: measure one text unit's rendered advance, then slide the
  // textPath's startOffset and wrap modulo that unit so the loop is invisible.
  const textRef = useRef<SVGTextElement>(null)
  const textPathRef = useRef<SVGTextPathElement>(null)
  const unitLen = useRef(0)

  useEffect(() => {
    if (textRef.current) {
      unitLen.current = textRef.current.getComputedTextLength() / REPEAT
    }
  }, [])

  useAnimationFrame((t) => {
    const unit = unitLen.current
    if (!unit || !textPathRef.current) return
    // Positive startOffset advances the glyph run toward the path's end, streaming
    // the text left → right (enters at the top-left start, exits up the right end).
    // The ~300px off-stage lead-in on WIGGLE_PATH absorbs the empty gap startOffset
    // opens at the very start, and the off-stage lead-out appended to the path end
    // (a straight segment continuing the final tangent past the viewport) gives the
    // leading glyphs track to ride off-screen instead of vanishing at a visible path
    // end — so glyphs roll on/off beyond both edges with no pop. Wrapping modulo one
    // repeated unit keeps the loop seamless (the text is periodic).
    const offset = ((t / 1000) * (unit / CRAWL_SECONDS)) % unit
    textPathRef.current.setAttribute('startOffset', String(offset))
  })

  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <div className="fixed inset-0 overflow-hidden bg-st-bg font-mono">
      {/* ── Layer 0: the "coming soon" wiggle — a full-viewport decorative layer.
          Uses the SAME centered + scaled frame as the content so it keeps wrapping
          the logo/horse exactly as designed, but as a sibling (not clipped by the
          stage) it bleeds past the frame to the real viewport edges. Its path
          endpoints land off-viewport, so the page container's overflow-hidden
          clips the textPath "pop" — the crawl rolls on/off the screen edges. ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{zIndex: 0, pointerEvents: 'none'}}>
        <div
          className="relative shrink-0"
          style={{width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'center'}}
        >
          {/* Intrinsic path is 1420×656; its rotated bounding box sits at frame-rel
              (-131,-1), so placing the element at (-93,92) with rotate(-7.77°) lands
              the AABB to match Figma (node 79:257). */}
          <motion.svg
            width={1420}
            height={656}
            viewBox="0 -2 1420 656"
            fill="none"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1.2, ease, delay: 0.2}}
            style={{position: 'absolute', left: -93, top: 92, transform: 'rotate(8deg)', overflow: 'visible'}}
          >
            <defs>
              <path id="wiggle" d={WIGGLE_PATH} fill="none" />
            </defs>
            <text
              ref={textRef}
              fill="#6ad0ef"
              style={{fontWeight: 300, fontSize: 20, letterSpacing: '0.22em'}}
            >
              <textPath ref={textPathRef} href="#wiggle" startOffset={0}>
                {CRAWL_TEXT}
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>

      {/* ── Layer 1: green blob + address — anchored to the real top-right VIEWPORT
          corner (not the scaled stage), so the blob always hugs the corner as a
          full-bleed decoration regardless of window aspect ratio. Scaled by the same
          factor as the design and pinned via transformOrigin 'top right'. Child
          offsets are the design positions measured from the frame's top-right corner
          (stage x=STAGE_W, y=0): the blob box right edge sits 78px past the corner
          (1263 − 1185) and the address right edge 52px inside it (1185 − 1133). On a
          width-fit window this is pixel-identical to the old stage placement; on
          wider windows it stays pinned to the corner instead of drifting inward. ── */}
      <div
        className="absolute top-0 right-0"
        style={{zIndex: 10, pointerEvents: 'none', width: 0, height: 0, transform: `scale(${scale})`, transformOrigin: 'top right'}}
      >
        {/* Full organic blob at the node's size + rotation (79:258): only its rounded
            corner pokes into the top-right; the rest bleeds off the viewport. Wrapper
            owns position/rotation; Framer drives just the entrance. */}
        <div
          style={{position: 'absolute', right: -78, top: -231, width: 422, height: 374, transform: 'rotate(-37.53deg)', transformOrigin: 'center'}}
        >
          <motion.img
            src="/images/blob.svg"
            alt=""
            aria-hidden
            initial={{opacity: 0, scale: 0.92}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 1, ease, delay: 0.1}}
            style={{display: 'block', width: '100%', height: '100%'}}
          />
        </div>
        {/* Address, cream, within the visible green (node 79:259) */}
        <motion.span
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.6, ease, delay: 0.55}}
          style={{position: 'absolute', right: 52, top: 52, width: 183, fontWeight: 300, fontSize: 20, color: '#fff1e7'}}
        >
          519 Hagan Ave
        </motion.span>
      </div>

      {/* ── Layer 2: centered + scaled content stage — only the logo, horse and
          COFFEE/SHINY THING wordmark live here. ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{zIndex: 20}}>
        <div
          className="relative shrink-0"
          style={{width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'center'}}
        >
          {/* Horse line illustration, centered above the wordmark (node 79:225) */}
          <motion.img
            src="/images/horse.svg"
            alt="Line illustration of a horse"
            width={242}
            height={274}
            initial={{opacity: 0, y: -24}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease, delay: 0.35}}
            style={{position: 'absolute', left: 470, top: 119}}
          />

          {/* "SHINY THING" wordmark (node 79:311) */}
          <motion.img
            src="/images/logo.svg"
            alt="Shiny Thing"
            width={505}
            height={76}
            initial={{opacity: 0, y: 24}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease, delay: 0.55}}
            style={{position: 'absolute', left: 340, top: 393}}
          />

          {/* "COFFEE" (node 79:256) */}
          <motion.span
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease, delay: 0.7}}
            style={{
              position: 'absolute',
              left: 493,
              top: 488,
              width: 220,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 37.21,
              letterSpacing: '0.22em',
              textIndent: '0.22em',
              color: '#ff0000',
            }}
          >
            COFFEE
          </motion.span>
        </div>
      </div>
    </div>
  )
}
