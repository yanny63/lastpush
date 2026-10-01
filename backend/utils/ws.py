class Websockets:
  def __init__(self):
    pass

class RegistrationWebsockets:
  def __init__(self):
    self.connections : dict[str, list] = {}

  async def connect(self, session, websocket):
    await websocket.accept()
    if session not in self.connections:
      self.connections[session] = []
    self.connections[session].append(websocket)

  async def disconnect(self, session):
    self.connections.pop(session, None)

  async def verify(self, session, message):
    for websocket in self.connections[session]:
      await websocket.send_json(message)
      await websocket.close()
    await self.disconnect(session)