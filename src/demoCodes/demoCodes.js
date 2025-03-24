export const demoCode = `
let groups = (fn) => {
  return fn.sometimes(x => x.room(0.2))
    .lpf(saw.range(8000,50).slow(2)).lpq(5)   
}

stack(
    groups(
      s("kik")
        .struct("1(3,4)").fast(4)
        .degradeBy(0.7)
        .note("f0")
        .fmSet({
            envelope: {
                attack: 0.005,
                decay: 2,
                sustain: 0,
                release: 0.5,
            },
            modulationEnvelope: {
                decay: 0,
                sustain: 1
            },
            modulationIndex: 13,  
            harmonicity: 18
        })
        .pEnvSet({
            attack: 0.005,
            decay: 0.1,
        })
        .hpfEnvSet({
            attack: 0.005,
            decay: 0.2,
            sustain: 0.1,
        })
        .hpfRange({
            min: 20,
            max: 200
        })
        .lpfEnvSet({
            attack: 0.005,
            decay: 0.1
        })
        .rarely(x => x.ply(2))
        .distort(sine.range(0.8, 2))
        .shape(0.5)
        .legato(2)
    ),
    groups(
      s("hh*16").n(4)
          .legato(0.2)
          .rarely(x => x.legato(0.8))
          .crush(5)
          .hpf(500)
    )
)`