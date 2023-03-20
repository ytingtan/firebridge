import cards from '../public/img/3.jpg'
import people from '../public/img/4.jpg'
import Image from 'next/image'

function About() {
    return (
        <>
        <div className="col-10 d-flex w-100 h-100 p-3 mx-auto flex-column mt-4 text-center" id="about">
		<main className="px-5">
			<h1>YOUR ONESTOP PLATFORM FOR EVERYTHING BRIDGE</h1>
			
		</main>
        <div className="container">
		<div className="row my-5">
			<div className="col-md-6 my-6">
				<Image src={cards} alt="Cards" className="w-100" />
				<h4 className="my-6">
					Analysis
				</h4>
				<h6 className="my-6">
					View analysis of past gameplays from Bridge Base Online. Compare statistics with optimal gameplay from the inbuilt algorithm.
				</h6>
			</div>
			<div className="col-md-6 my-6">
				<Image src={people} alt="People" className="w-100" />
				<h4 className="my-6" style={{textAlign: 'center'}}>
					Forum
				</h4>
				<h6 className="my-6" style={{textAlign: 'center'}}>
					Join a community of Bridge players. Discuss boards with each other and poll on best decision to make in various Bridge situations.
				</h6>
			</div>
		</div>
	    </div>
	    </div>
        </>
    );
}

export default About;