export type InView = () => boolean
type MakeInView = ({target, considerArea}: { target:HTMLElement, considerArea:boolean}) => InView

/**
 * Checa se elemento está no viewport do usuário
 */
export const inView:MakeInView = ({target, considerArea = false}) => {

  const top = ( target.offsetHeight - ( target.offsetHeight / 4 ) );
  const bottom = ( window.innerHeight + ( considerArea ? 0 : top ) )

  return () => {

    const rect = target.getBoundingClientRect()

    return (
      rect.top 	>= 0 &&
      rect.left 	>= 0 &&
      rect.bottom <= bottom &&
      rect.right 	<= window.innerWidth
    );
  }
}
