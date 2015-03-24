/**
 *    Webarena GUI.input Gestures
 *    @author Dominik Roﬂ, University of Paderborn, 2015
 *
 */
 
 //MultiFingerDrag
 GUI.input.addGesture(function(multiSession) {
	if(multiSession.count == 3) {
		switch(multiSession.state) {
		case GUI.input.STATE_START:
			GUI.input.trigger("MultiFingerDrag.start", multiSession);
		break;
		case GUI.input.STATE_MOVE:
			GUI.input.trigger("MultiFingerDrag.move", multiSession);
		break;
		case GUI.input.STATE_END:
			GUI.input.trigger("MultiFingerDrag.end", multiSession);
		break;
		}
		
		GUI.input.trigger("MultiFingerDrag", multiSession);
		
		return true;
	}
	
	return false;
 });