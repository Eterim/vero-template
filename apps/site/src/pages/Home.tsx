import { Hero } from '../sections/Hero'
import { AgtRules, Components, Gallery, HowItWorks, OpenSource, Showcase, Tools, UseInVero } from '../sections/Sections'

export default function Home() {
  return (
    <>
      <Hero />
      <Showcase />
      <AgtRules />
      <Components />
      <Tools />
      <HowItWorks />
      <Gallery />
      <UseInVero />
      <OpenSource />
    </>
  )
}
